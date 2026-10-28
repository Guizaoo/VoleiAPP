import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CircleCheck, ExternalLink, Info, MapPin, ShieldAlert } from 'lucide-react';
import { cityLabel, simulationResultNotice } from '../config/site';
import { amenityLabels, coverageLabels, modalityLabels } from '../data/labels';
import { findSelectableSlot } from '../lib/availability';
import {
  capitalize,
  formatCurrency,
  formatDateLong,
  formatHour,
  formatPriceShort,
  formatRelativeDay,
} from '../lib/format';
import { courtsService } from '../services/courtsService';
import type { Court, SimulatedBooking } from '../types/court';
import { AmenityIcon } from './AmenityIcon';
import { BookingSummary } from './BookingSummary';
import { DateStrip } from './DateStrip';
import { Dialog } from './Dialog';
import { Gallery } from './Gallery';
import { SlotGrid } from './SlotGrid';
import styles from './CourtDetails.module.css';

type Step = 'select' | 'review' | 'success';

interface CourtDetailsProps {
  court: Court;
  date: string;
  slotId: string | null;
  dates: string[];
  now: Date;
  onDateChange: (date: string) => void;
  onSlotChange: (slotId: string | null) => void;
  onClose: () => void;
}

export function CourtDetails({ court, date, slotId, dates, now, onDateChange, onSlotChange, onClose }: CourtDetailsProps) {
  const [step, setStep] = useState<Step>('select');
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<SimulatedBooking | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const bookingRef = useRef<HTMLElement>(null);
  const previousStep = useRef<Step>(step);

  const slots = courtsService.getAvailability(court, date, now);
  const selectedSlot = findSelectableSlot(court, slotId, now);
  const titleId = `details-title-${court.id}`;

  // Se o horário escolhido deixar de ser válido (ex.: o horário passou), limpa a seleção.
  useEffect(() => {
    if (step !== 'success' && slotId && !selectedSlot) {
      setStep('select');
      onSlotChange(null);
      setError('O horário escolhido não está mais disponível. Escolha outro.');
    }
  }, [step, slotId, selectedSlot, onSlotChange]);

  // Ao trocar de etapa, leva o foco (e a leitura do leitor de tela) para o novo título.
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    const heading = stepHeadingRef.current;
    if (!heading) return;
    heading.focus({ preventScroll: true });
    if (step === 'select') {
      heading.scrollIntoView({ block: 'start' });
    } else {
      const body = heading.closest<HTMLElement>('[data-dialog-body]');
      if (body) body.scrollTop = 0;
    }
  }, [step]);

  // Quando a quadra é aberta a partir de um horário do card, mostra a área de horários.
  useEffect(() => {
    if (slotId) bookingRef.current?.scrollIntoView({ block: 'start' });
  }, []); // apenas na abertura

  const handleDateChange = (next: string) => {
    setError(null);
    onDateChange(next);
  };

  const handleSlotChange = (next: string) => {
    setError(null);
    onSlotChange(next);
  };

  const goToReview = () => {
    if (!selectedSlot) {
      setError('Escolha um horário livre para continuar.');
      bookingRef.current?.scrollIntoView({ block: 'start' });
      return;
    }
    setError(null);
    setStep('review');
  };

  const confirmSimulation = () => {
    const result = selectedSlot ? courtsService.simulateBooking(court, selectedSlot.id, now) : null;
    if (!result) {
      setStep('select');
      onSlotChange(null);
      setError('Esse horário acabou de ficar indisponível. Escolha outro.');
      return;
    }
    setBooking(result);
    setStep('success');
  };

  const chooseAnother = () => {
    setBooking(null);
    onSlotChange(null);
    setStep('select');
  };

  const footer =
    step === 'select' ? (
      <div className={styles.footerBar}>
        <div className={styles.footerInfo} aria-live="polite">
          {selectedSlot ? (
            <>
              <strong>{formatCurrency(court.pricePerHourCents)}</strong>
              <span>
                {capitalize(formatRelativeDay(date, now))} · {formatHour(selectedSlot.startHour)}
              </span>
            </>
          ) : (
            <>
              <strong>{formatPriceShort(court.pricePerHourCents)}/hora</strong>
              <span>Escolha um horário</span>
            </>
          )}
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={goToReview}>
          Simular reserva
        </button>
      </div>
    ) : step === 'review' ? (
      <div className={styles.footerBar}>
        <button type="button" className={`btn btn-secondary ${styles.backButton}`} onClick={() => setStep('select')}>
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar
        </button>
        <button type="button" className={`btn btn-primary ${styles.confirmButton}`} onClick={confirmSimulation}>
          Confirmar simulação
        </button>
      </div>
    ) : (
      <div className={styles.footerStack}>
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={onClose}>
          Voltar a explorar quadras
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={chooseAnother}>
          Simular outro horário nesta quadra
        </button>
      </div>
    );

  return (
    <Dialog open onClose={onClose} titleId={titleId} size="lg" footer={footer} closeLabel="Fechar detalhes da quadra">
      {step === 'select' && (
        <div className={styles.layout}>
          <div className={styles.info}>
            <Gallery photos={court.photos} label={`Fotos da ${court.name}`} />

            <div className={styles.infoBody}>
              <div className={styles.badges}>
                <span className={styles.badge}>{modalityLabels[court.modality]}</span>
                <span className={styles.badge}>{coverageLabels[court.coverage]}</span>
              </div>
              <h2 id={titleId} className={styles.name}>
                {court.name}
              </h2>
              <p className={styles.location}>
                <MapPin size={16} aria-hidden="true" />
                <span>
                  {court.neighborhood}, {cityLabel} · {court.addressHint}
                </span>
              </p>
              {court.source && (
                <p className={styles.source}>
                  Informações de fonte pública, podem estar desatualizadas:{' '}
                  <a href={court.source.url} target="_blank" rel="noreferrer">
                    {court.source.label}
                    <ExternalLink size={13} aria-hidden="true" />
                    <span className="visually-hidden"> (abre em nova aba)</span>
                  </a>
                </p>
              )}
              <p className={styles.price}>
                <strong>{formatPriceShort(court.pricePerHourCents)}</strong> por hora
              </p>
              <p className={styles.description}>{court.description}</p>

              <h3 className={styles.subTitle}>Comodidades</h3>
              <ul className={styles.amenities}>
                {court.amenities.map((a) => (
                  <li key={a}>
                    <AmenityIcon amenity={a} />
                    {amenityLabels[a]}
                  </li>
                ))}
              </ul>

              <h3 className={styles.subTitle}>Regras básicas</h3>
              <ul className={styles.rules}>
                {court.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          <section ref={bookingRef} className={styles.booking} aria-labelledby="booking-title">
            <h3 id="booking-title" ref={stepHeadingRef} tabIndex={-1} className={styles.bookingTitle}>
              Escolha data e horário
            </h3>
            <DateStrip dates={dates} value={date} onChange={handleDateChange} now={now} legend="Data" />
            <SlotGrid slots={slots} selectedSlotId={selectedSlot?.id ?? null} onSelect={handleSlotChange} />
            {error && (
              <p className={styles.error} role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                {error}
              </p>
            )}
            <BookingSummary court={court} date={date} slot={selectedSlot} />
            <p className={styles.hint}>
              <Info size={16} aria-hidden="true" />
              Horários fictícios para demonstração, não atualizados em tempo real.
            </p>
          </section>
        </div>
      )}

      {step === 'review' && selectedSlot && (
        <div className={styles.narrow}>
          <h2 id={titleId} ref={stepHeadingRef} tabIndex={-1} className={styles.stepTitle}>
            Confira antes de simular
          </h2>
          <p className={styles.stepLead}>
            {court.name} · {formatDateLong(date)}, às {formatHour(selectedSlot.startHour)}.
          </p>
          <div className={styles.warning} role="note">
            <ShieldAlert size={22} aria-hidden="true" />
            <div>
              <strong>Nenhuma reserva real será realizada.</strong>
              <p>
                Este é um protótipo: ao confirmar, nada é cobrado, o estabelecimento não é avisado e nenhum dado pessoal é
                solicitado.
              </p>
            </div>
          </div>
          <BookingSummary court={court} date={date} slot={selectedSlot} variant="plain" />
        </div>
      )}

      {step === 'success' && booking && (
        <div className={`${styles.narrow} ${styles.success}`}>
          <span className={styles.successIcon}>
            <CircleCheck size={44} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <h2 id={titleId} ref={stepHeadingRef} tabIndex={-1} className={styles.stepTitle}>
            Reserva simulada!
          </h2>
          <p className={styles.stepLead}>
            Assim seria a confirmação da sua partida na {booking.courtName}, {formatDateLong(booking.date)}, às{' '}
            {formatHour(booking.startHour)}.
          </p>
          <BookingSummary
            court={court}
            date={booking.date}
            slot={slots.find((s) => s.startHour === booking.startHour) ?? null}
            title="Resumo"
            variant="plain"
          />
          <p className={styles.demoNotice} role="status">
            <Info size={18} aria-hidden="true" />
            {simulationResultNotice}
          </p>
        </div>
      )}
    </Dialog>
  );
}
