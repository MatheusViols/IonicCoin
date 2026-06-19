import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    try {
      const storage = await this.storage.create();
      this._storage = storage;
      console.log('Ionic Storage inicializado com sucesso.');
    } catch (error) {
      console.error('Erro ao inicializar Ionic Storage:', error);
    }
  }

  // Define um valor no storage
  async set(key: string, value: any): Promise<void> {
    await this.ensureInitialized();
    await this._storage?.set(key, value);
  }

  // Obtém um valor do storage
  async get(key: string): Promise<any> {
    await this.ensureInitialized();
    return await this._storage?.get(key);
  }

  // Remove um valor do storage
  async remove(key: string): Promise<void> {
    await this.ensureInitialized();
    await this._storage?.remove(key);
  }

  // Limpa todo o storage
  async clear(): Promise<void> {
    await this.ensureInitialized();
    await this._storage?.clear();
  }

  // Métodos auxiliares para taxas de câmbio
  async saveRates(baseCode: string, rates: any): Promise<void> {
    const data = {
      rates,
      timestamp: Date.now()
    };
    await this.set(`rates_${baseCode}`, data);
  }

  async getRates(baseCode: string): Promise<any> {
    return await this.get(`rates_${baseCode}`);
  }

  // Função auxiliar para garantir que a inicialização foi concluída antes de qualquer operação
  private async ensureInitialized(): Promise<void> {
    if (this._storage) return;

    let retries = 0;
    while (!this._storage && retries < 20) {
      await new Promise(resolve => setTimeout(resolve, 50));
      retries++;
    }

    if (!this._storage) {
      const storage = await this.storage.create();
      this._storage = storage;
    }
  }
}
