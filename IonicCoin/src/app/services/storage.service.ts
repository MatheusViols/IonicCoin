import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Conversion } from '../models/conversion.model';

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

  // Métodos para histórico de conversões

  /** Salva uma conversão no histórico (mais recente primeiro, limite de 100) */
  async saveConversion(conversion: Conversion): Promise<void> {
    const history: Conversion[] = (await this.get('conversion_history')) || [];
    history.unshift(conversion);
    const trimmed = history.slice(0, 100);
    await this.set('conversion_history', trimmed);
  }

  /** Retorna o histórico completo de conversões salvas */
  async getHistory(): Promise<Conversion[]> {
    return (await this.get('conversion_history')) || [];
  }

  /** Remove todo o histórico de conversões */
  async clearHistory(): Promise<void> {
    await this.remove('conversion_history');
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
