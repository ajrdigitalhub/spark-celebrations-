import { Injectable, signal, computed, effect } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;

  // Signals for reactive auth state
  private _user = signal<User | null>(null);
  private _session = signal<Session | null>(null);
  private _loading = signal<boolean>(true);

  readonly user = this._user.asReadonly();
  readonly session = this._session.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.initAuthListener();
  }

  private async initAuthListener(): Promise<void> {
    // Get initial session
    const { data: { session } } = await this.supabase.auth.getSession();
    this._session.set(session);
    this._user.set(session?.user ?? null);
    this._loading.set(false);

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
      this._loading.set(false);
    });
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    this._loading.set(true);
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    this._loading.set(false);

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this._user.set(null);
    this._session.set(null);
  }

  getAccessToken(): string | null {
    return this._session()?.access_token ?? null;
  }
}
