/**
 * Maps Supabase Auth errors to user-friendly Thai messages.
 * Critical security rule: Never reveal whether an email exists on login failure.
 */
export function mapSupabaseAuthError(
  error: any,
  context: 'login' | 'register' | 'recovery' | 'refresh' | 'password_change' | 'general' = 'general',
): string {
  if (!error) {
    return 'เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาลองใหม่อีกครั้ง';
  }

  const rawMessage = (typeof error === 'string' ? error : error.message || '').toLowerCase();
  const errorCode = (error.code || error.error_code || '').toLowerCase();
  const errorStatus = error.status;

  // 1. Email not confirmed check
  if (
    rawMessage.includes('email not confirmed') ||
    rawMessage.includes('not confirmed') ||
    errorCode === 'email_not_confirmed'
  ) {
    return 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ';
  }

  // 2. Login context: never reveal whether an email exists or if password is wrong
  if (context === 'login') {
    if (
      rawMessage.includes('invalid login credentials') ||
      rawMessage.includes('invalid credentials') ||
      rawMessage.includes('user not found') ||
      rawMessage.includes('invalid grant') ||
      errorCode === 'invalid_credentials' ||
      errorStatus === 400
    ) {
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    }
  }

  // 3. User already exists / already registered (Registration context)
  if (
    rawMessage.includes('user already registered') ||
    rawMessage.includes('already exists') ||
    rawMessage.includes('duplicate key') ||
    errorCode === 'user_already_exists'
  ) {
    return 'อีเมลนี้ถูกใช้แล้ว';
  }

  // 4. Session expired / invalid refresh token
  if (
    rawMessage.includes('invalid refresh token') ||
    rawMessage.includes('token expired') ||
    rawMessage.includes('jwt expired') ||
    rawMessage.includes('session expired') ||
    errorCode === 'invalid_grant' ||
    errorCode === 'refresh_token_not_found'
  ) {
    return 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
  }

  // 5. Password length / complexity requirements
  if (
    rawMessage.includes('password should be at least') ||
    rawMessage.includes('password is too short') ||
    errorCode === 'weak_password'
  ) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
  }

  // 6. Recovery token invalid or expired
  if (
    context === 'recovery' &&
    (rawMessage.includes('invalid token') ||
      rawMessage.includes('token has expired') ||
      rawMessage.includes('otp expired') ||
      rawMessage.includes('not found'))
  ) {
    return 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ';
  }

  // 7. Rate limit exceeded
  if (
    rawMessage.includes('rate limit') ||
    rawMessage.includes('over email send rate limit') ||
    errorCode === 'over_email_send_rate_limit' ||
    errorCode === 'too_many_requests'
  ) {
    return 'มีการส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง';
  }

  // 8. General fallback
  return 'เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาลองใหม่อีกครั้ง';
}
