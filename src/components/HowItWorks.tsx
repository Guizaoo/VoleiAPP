import { CalendarClock, MousePointerClick, Search } from 'lucide-react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    icon: Search,
    title: 'Encontre uma quadra',
    text: 'Busque pelo bairro ou nome e filtre por modalidade, preço e cobertura.',
  },
  {
    icon: CalendarClock,
    title: 'Escolha seu horário',
    text: 'Veja fotos, comodidades e os horários livres da data que você quer jogar.',
  },
  {
    icon: MousePointerClick,
    title: 'Confira e simule sua reserva',
    text: 'Revise quadra, data, horário e total antes de simular. Sem cadastro.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section" aria-labelledby="como-funciona-title" tabIndex={-1}>
      <div className="container">
        <h2 id="como-funciona-title" className="section-title">
          Do “tem horário?” ao jogo marcado em três passos
        </h2>
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.number} aria-hidden="true">
                {i + 1}
              </span>
              <span className={styles.icon}>
                <step.icon size={24} aria-hidden="true" />
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
