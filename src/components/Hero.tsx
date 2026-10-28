import { useState, type FormEvent } from 'react';
import { ArrowRight, CalendarCheck, Clock, Search, Wallet } from 'lucide-react';
import type { Modality } from '../types/court';
import { CourtImage } from './CourtImage';
import styles from './Hero.module.css';

interface HeroProps {
  onSearch: (query: string) => void;
  onPickModality: (modality: Modality) => void;
  onBrowse: () => void;
}

const heroPhoto = {
  src: '/images/hero-rede-entardecer.jpg',
  alt: 'Rede de vôlei de praia ao entardecer, com o céu alaranjado ao fundo',
  width: 1100,
  height: 825,
};

export function Hero({ onSearch, onPickModality, onBrowse }: HeroProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  return (
    <section id="inicio" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <h1 id="hero-title" className={styles.title}>
            Sua próxima partida <span className={styles.highlight}>começa aqui.</span>
          </h1>
          <p className={styles.lead}>
            Veja fotos, preços e horários livres das quadras perto de você e escolha o seu em poucos toques — sem
            ficar esperando resposta no WhatsApp.
          </p>

          <form className={styles.search} role="search" onSubmit={handleSubmit}>
            <label htmlFor="hero-search" className={styles.searchLabel}>
              Buscar por bairro ou nome da quadra
            </label>
            <div className={styles.searchRow}>
              <Search size={20} className={styles.searchIcon} aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                inputMode="search"
                autoComplete="off"
                enterKeyHint="search"
                placeholder="Ex.: Calhau, Cohama…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className={`btn btn-primary ${styles.searchButton}`}>
                Buscar
              </button>
            </div>
          </form>

          <div className={styles.quick} aria-label="Atalhos de modalidade" role="group">
            <button type="button" onClick={() => onPickModality('indoor')}>
              Vôlei de quadra
            </button>
            <button type="button" onClick={() => onPickModality('beach')}>
              Vôlei de areia
            </button>
          </div>

          <button type="button" className={`btn btn-secondary btn-lg ${styles.browse}`} onClick={onBrowse}>
            Ver quadras disponíveis
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.visual}>
          <div className={styles.photo}>
            <CourtImage photo={heroPhoto} priority />
          </div>
          <ul className={styles.benefits}>
            <li>
              <Wallet size={18} aria-hidden="true" /> Preço por hora na tela
            </li>
            <li>
              <Clock size={18} aria-hidden="true" /> Horários livres e ocupados
            </li>
            <li>
              <CalendarCheck size={18} aria-hidden="true" /> Reserva em poucos passos
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
