import { useState } from 'react';
import { CalendarCheck2, Construction, MessageCircleOff, Store, Tags } from 'lucide-react';
import { siteConfig } from '../config/site';
import { Dialog } from './Dialog';
import styles from './OwnersSection.module.css';

const benefits = [
  { icon: MessageCircleOff, text: 'Menos mensagens repetidas perguntando preço e horário.' },
  { icon: Tags, text: 'Preços e regras sempre visíveis para quem procura quadra.' },
  { icon: CalendarCheck2, text: 'Horários livres à mostra, para não perder quem decide na hora.' },
];

export function OwnersSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="para-donos" className="section" aria-labelledby="para-donos-title" tabIndex={-1}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.content}>
            <h2 id="para-donos-title" className={`section-title ${styles.title}`}>
              Sua quadra encontrada por quem já quer jogar
            </h2>
            <p className={styles.lead}>
              Com preços e horários disponíveis on-line, o cliente decide sem precisar esperar resposta — e você responde
              menos perguntas no WhatsApp.
            </p>
            <button type="button" className={`btn btn-lg ${styles.cta}`} onClick={() => setOpen(true)} aria-haspopup="dialog">
              <Store size={20} aria-hidden="true" />
              Quero cadastrar minha quadra
            </button>
          </div>
          <ul className={styles.benefits}>
            {benefits.map((b) => (
              <li key={b.text}>
                <span className={styles.benefitIcon}>
                  <b.icon size={20} aria-hidden="true" />
                </span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        titleId="owners-dialog-title"
        footer={
          <button type="button" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>
            Entendi
          </button>
        }
      >
        <div className={styles.dialogBody}>
          <span className={styles.dialogIcon}>
            <Construction size={28} aria-hidden="true" />
          </span>
          <h2 id="owners-dialog-title" className={styles.dialogTitle}>
            Cadastro de estabelecimentos em breve
          </h2>
          <p>
            O {siteConfig.name} ainda é um protótipo. O cadastro de quadras, com painel para gerenciar preços e horários,
            estará disponível em uma próxima etapa.
          </p>
          <p>Nesta demonstração nenhum dado é coletado ou enviado.</p>
        </div>
      </Dialog>
    </section>
  );
}
