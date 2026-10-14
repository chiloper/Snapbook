import { mapSupabaseAuthError } from './auth-error-mapper';

describe('auth-error-mapper', () => {
  describe('login errors', () => {
    it('should map invalid credentials to generic Thai error', () => {
      const error = { message: 'Invalid login credentials', status: 400 };
      expect(mapSupabaseAuthError(error, 'login')).toBe(
        'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      );
    });

    it('should never reveal whether user exists on login failure', () => {
      const errorUserNotFound = { message: 'User not found', status: 400 };
      expect(mapSupabaseAuthError(errorUserNotFound, 'login')).toBe(
        'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      );

      const errorInvalidGrant = { message: 'invalid grant', status: 400 };
      expect(mapSupabaseAuthError(errorInvalidGrant, 'login')).toBe(
        'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      );
    });
  });

  describe('registration errors', () => {
    it('should map already registered user to Thai duplicate message', () => {
      const error = { message: 'User already registered', status: 422 };
      expect(mapSupabaseAuthError(error, 'register')).toBe('อีเมลนี้ถูกใช้แล้ว');
    });

    it('should map email already exists', () => {
      const error = { message: 'A user with this email address already exists' };
      expect(mapSupabaseAuthError(error, 'register')).toBe('อีเมลนี้ถูกใช้แล้ว');
    });
  });

  describe('email confirmation errors', () => {
    it('should map email not confirmed error', () => {
      const error = { message: 'Email not confirmed' };
      expect(mapSupabaseAuthError(error, 'login')).toBe(
        'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
      );
    });
  });

  describe('session & refresh token errors', () => {
    it('should map expired or invalid refresh token to session expired message', () => {
      const error = { message: 'Invalid Refresh Token: Refresh Token Not Found' };
      expect(mapSupabaseAuthError(error, 'refresh')).toBe(
        'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
      );
    });

    it('should map JWT expired to session expired message', () => {
      const error = { message: 'jwt expired' };
      expect(mapSupabaseAuthError(error, 'general')).toBe(
        'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
      );
    });
  });

  describe('password validation errors', () => {
    it('should map password too short error', () => {
      const error = { message: 'Password should be at least 6 characters' };
      expect(mapSupabaseAuthError(error, 'register')).toBe(
        'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
      );
    });
  });

  describe('recovery errors', () => {
    it('should map invalid recovery token', () => {
      const error = { message: 'Token has expired or is invalid' };
      expect(mapSupabaseAuthError(error, 'recovery')).toBe(
        'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ',
      );
    });
  });

  describe('rate limit errors', () => {
    it('should map rate limit exceeded', () => {
      const error = { message: 'Over email send rate limit' };
      expect(mapSupabaseAuthError(error, 'general')).toBe(
        'มีการส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
      );
    });
  });

  describe('fallback errors', () => {
    it('should return general Thai error on null or unknown error', () => {
      expect(mapSupabaseAuthError(null)).toBe(
        'เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาลองใหม่อีกครั้ง',
      );
      expect(mapSupabaseAuthError({ message: 'some unexpected internal error' })).toBe(
        'เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาลองใหม่อีกครั้ง',
      );
    });
  });
});
