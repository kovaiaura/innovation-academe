import { useState, useEffect, useCallback } from 'react';
import { 
  fetchCreditDebitNotes, 
  fetchNotesForInvoice,
  createCreditDebitNote, 
  updateNoteStatus,
  deleteCreditDebitNote 
} from '@/services/credit-debit-note.service';
import type { CreditDebitNote, CreateNoteInput, NoteType, NoteStatus } from '@/types/credit-debit-note';
import { toast } from 'sonner';

export function useCreditDebitNotes(
  noteType?: NoteType,
  startDate?: string,
  endDate?: string
) {
  const [notes, setNotes] = useState<CreditDebitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCreditDebitNotes(noteType, startDate, endDate);
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [noteType, startDate, endDate]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = async (input: CreateNoteInput) => {
    try {
      const note = await createCreditDebitNote(input);
      toast.success(`${input.note_type === 'credit' ? 'Credit' : 'Debit'} note created`);
      await loadNotes();
      return note;
    } catch (err) {
      console.error('Error creating note:', err);
      toast.error('Failed to create note');
      throw err;
    }
  };

  const updateStatus = async (id: string, status: NoteStatus) => {
    try {
      await updateNoteStatus(id, status);
      toast.success('Note status updated');
      await loadNotes();
    } catch (err) {
      console.error('Error updating note status:', err);
      toast.error('Failed to update status');
      throw err;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteCreditDebitNote(id);
      toast.success('Note deleted');
      await loadNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      toast.error('Failed to delete note');
      throw err;
    }
  };

  return { 
    notes, 
    creditNotes: notes.filter(n => n.note_type === 'credit'),
    debitNotes: notes.filter(n => n.note_type === 'debit'),
    loading, 
    error, 
    refetch: loadNotes,
    createNote,
    updateStatus,
    deleteNote,
  };
}

export function useNotesForInvoice(invoiceId: string | null) {
  const [notes, setNotes] = useState<CreditDebitNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadNotes = useCallback(async () => {
    if (!invoiceId) {
      setNotes([]);
      return;
    }
    
    try {
      setLoading(true);
      const data = await fetchNotesForInvoice(invoiceId);
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes for invoice:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return { notes, loading, error, refetch: loadNotes };
}
