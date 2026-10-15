import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly client: SupabaseClient<any, any, any>;
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;
  private readonly dbSchema: string;

  constructor(private readonly configService: ConfigService) {
    const rawUrl = this.configService.get<string>('SUPABASE_URL', '');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
      'placeholder-service-role-key',
    );
    const rawAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY', '');
    this.dbSchema = this.configService.get<string>('SUPABASE_DB_SCHEMA', 'slipsum');

    this.supabaseUrl = this.normalizeSupabaseUrl(rawUrl);
    // If anon key is not set, fallback to service role key so client creation doesn't fail
    this.supabaseAnonKey = rawAnonKey || serviceRoleKey || 'placeholder-anon-key';

    if (!rawUrl || rawUrl.includes('placeholder')) {
      this.logger.warn(
        'SUPABASE_URL is not configured or using placeholder. Please set your Project URL in .env',
      );
    }

    if (!serviceRoleKey || serviceRoleKey.includes('placeholder')) {
      this.logger.warn('SUPABASE_SERVICE_ROLE_KEY is not configured in .env');
    }

    this.logger.log(`Using Supabase Database Schema: "${this.dbSchema}"`);

    // Service-role client for backend database and storage operations
    this.client = createClient(this.supabaseUrl, serviceRoleKey || 'dummy-key', {
      db: {
        schema: this.dbSchema,
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async onModuleInit() {
    await this.ensureBucket('slips');
  }

  /**
   * Automatically verifies and creates storage bucket if it does not exist yet.
   */
  async ensureBucket(bucket: string = 'slips'): Promise<void> {
    try {
      const { data: buckets, error } = await this.client.storage.listBuckets();
      if (error) {
        this.logger.warn(`Could not list storage buckets: ${error.message}`);
        return;
      }
      const exists = buckets?.some((b) => b.id === bucket || b.name === bucket);
      if (!exists) {
        this.logger.log(`Storage bucket "${bucket}" does not exist. Creating it now...`);
        const { error: createErr } = await this.client.storage.createBucket(bucket, {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        if (createErr) {
          this.logger.error(`Failed to auto-create bucket "${bucket}": ${createErr.message}`);
        } else {
          this.logger.log(`Storage bucket "${bucket}" created successfully!`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Error ensuring storage bucket "${bucket}": ${err.message}`);
    }
  }

  private normalizeSupabaseUrl(url: string): string {
    if (!url || !url.trim()) {
      return 'https://placeholder.supabase.co';
    }

    const trimmed = url.trim();

    // Handle case where user pasted direct PostgreSQL connection string
    // e.g. postgresql://postgres.syerrmqusmbuzyiofbzz:password@aws-0-...:5432/postgres
    if (trimmed.startsWith('postgresql://') || trimmed.startsWith('postgres://')) {
      const match = trimmed.match(/postgres\.([a-zA-Z0-9_-]+):/);
      if (match && match[1]) {
        const projectId = match[1];
        const converted = `https://${projectId}.supabase.co`;
        this.logger.warn(
          `Detected PostgreSQL connection string in SUPABASE_URL. Automatically converted to Project API URL: ${converted}`,
        );
        return converted;
      }
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }

    return trimmed;
  }

  /**
   * Returns the schema currently in use.
   */
  getDbSchema(): string {
    return this.dbSchema;
  }

  /**
   * Returns the singleton service-role client for secure database and storage operations.
   */
  getClient(): SupabaseClient<any, any, any> {
    return this.client;
  }

  /**
   * Factory returning a NEW anonymous-key client per auth call.
   * Ensures sessions never persist or leak between users across concurrent requests.
   */
  createAnonClient(): SupabaseClient<any, any, any> {
    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      db: {
        schema: this.dbSchema,
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  async uploadSlipImage(
    bucket: string,
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ path: string; error?: string }> {
    let { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    // If bucket not found, attempt to auto-create bucket and retry
    if (error && (error.message.toLowerCase().includes('not found') || (error as any).statusCode === 404)) {
      this.logger.warn(`Bucket "${bucket}" not found during upload. Auto-creating bucket...`);
      await this.ensureBucket(bucket);
      const retry = await this.client.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType,
          upsert: true,
        });
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      const errMsg = error?.message || 'No data returned from storage upload';
      this.logger.error(`Failed to upload to storage bucket "${bucket}" at path "${path}": ${errMsg}`);
      return { path: '', error: errMsg };
    }
    return { path: data.path };
  }

  async createSignedUrl(
    bucket: string,
    path: string,
    expiresInSeconds: number = 600,
  ): Promise<{ signedUrl?: string; error?: string }> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return {
        error: error?.message || 'ไม่สามารถสร้างลิงก์สำหรับดาวน์โหลดรูปภาพได้',
      };
    }
    return { signedUrl: data.signedUrl };
  }

  async deleteSlipImage(bucket: string, path: string): Promise<boolean> {
    const { error } = await this.client.storage.from(bucket).remove([path]);
    if (error) {
      this.logger.error(`Failed to delete slip image at ${path}: ${error.message}`);
      return false;
    }
    return true;
  }
}
