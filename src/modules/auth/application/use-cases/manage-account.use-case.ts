import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import * as argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';
import { AUTH_ACCOUNT_REPOSITORY_TOKEN } from '../../domain/repositories/auth-account.repository';
import type { AuthAccountRepository } from '../../domain/repositories/auth-account.repository';
import { AuthAccount } from '../../domain/entities/auth-account.entity';
import { CreateAccountDto, ResetPasswordDto } from '../dtos/account.dto';

@Injectable()
export class ManageAccountUseCase {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepo: AuthAccountRepository,
  ) {}

  async create(dto: CreateAccountDto): Promise<AuthAccount> {
    const existing = await this.accountRepo.getByUsername(dto.username);
    if (existing) {
      throw new ConflictException(`Username '${dto.username}' sudah terdaftar`);
    }

    const passwordHash = await argon2.hash(dto.password);
    const newAccount = new AuthAccount({
      auth_id: uuidv7(),
      auth_username: dto.username,
      auth_password_hash: passwordHash,
      auth_is_superadmin: Boolean(dto.is_superadmin),
      auth_is_active: true,
      auth_created_at: new Date(),
      auth_updated_at: new Date(),
    });

    return this.accountRepo.create(newAccount);
  }

  async resetPassword(authId: string, dto: ResetPasswordDto): Promise<boolean> {
    const account = await this.accountRepo.getById(authId);
    if (!account) {
      throw new NotFoundException('Akun tidak ditemukan');
    }

    account.auth_password_hash = await argon2.hash(dto.new_password);
    await this.accountRepo.update(account);
    return true;
  }

  async toggleActive(authId: string): Promise<AuthAccount> {
    const account = await this.accountRepo.getById(authId);
    if (!account) {
      throw new NotFoundException('Akun tidak ditemukan');
    }

    account.auth_is_active = !account.auth_is_active;
    return this.accountRepo.update(account);
  }
}
