import React, { useState } from 'react';
import { Section, Button, Input, Textarea, SuccessState } from '../components/UIComponents';
import { FormType, InterestFormData, SponsorFormData, SupporterFormData } from '../types';
import { saveSubmission } from '../services/db';
import { Handshake, Camera, BellRing, ArrowRight } from 'lucide-react';

interface GetInvolvedProps {
  setSponsorModalOpen: (v: boolean) => void;
  setSupporterModalOpen: (v: boolean) => void;
}

/* =========================
   WAITLIST FORM
========================= */
export const GetInvolved: React.FC<GetInvolvedProps> = ({
  setSponsorModalOpen,
  setSupporterModalOpen
}) => {
  const [formData, setFormData] = useState<InterestFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    expectations: '',
    gdpr: false
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const ok = await saveSubmission(FormType.INTEREST, formData);

    if (ok) {
      setStatus('success');
    } else {
      setStatus('idle');
      setError(
        'Ocorreu um erro. Tente novamente mais tarde ou contacte tugagilportugal@gmail.com'
      );
    }
  };

  return (
