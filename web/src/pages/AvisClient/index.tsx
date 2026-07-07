import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AvisClient() {
  const [nom, setNom] = useState('');
  const [note, setNote] = useState(5);
  const [hoverNote, setHoverNote] = useState(0);
  const [texte, setTexte] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (texte.trim().length < 10) {
      setStatus('error');
      setErrorMessage('Le témoignage doit contenir au moins 10 caractères.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('temoignages')
        .insert([
          { nom: nom.trim(), note, texte: texte.trim() }
        ]);

      if (error) throw error;

      setStatus('success');
      setNom('');
      setNote(5);
      setTexte('');
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de l'avis:", error);
      setStatus('error');
      setErrorMessage(error.message || "Une erreur s'est produite lors de l'envoi de votre avis.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <img 
            src="https://i.postimg.cc/vZQQ6y8s/logo.png" 
            alt="KPL SERVICES Logo" 
            className="w-[120px] h-auto mb-6"
          />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-[#E91E8C]">
            Laissez votre avis
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Votre retour est précieux pour nous
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-md bg-green-50 p-4 mt-8 border border-green-200">
            <h3 className="text-sm font-medium text-green-800 text-center">
              Merci pour votre avis ! Il sera publié après validation.
            </h3>
          </div>
        ) : (
          <form className="mt-8 space-y-6 bg-gray-50 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="rounded-md bg-red-50 p-4">
                <h3 className="text-sm font-medium text-red-800">
                  {errorMessage}
                </h3>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom du client <span className="text-red-500">*</span>
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#E91E8C] focus:border-[#E91E8C] sm:text-sm"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Votre note <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNote(star)}
                      onMouseEnter={() => setHoverNote(star)}
                      onMouseLeave={() => setHoverNote(0)}
                      className="focus:outline-none transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverNote || note)
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="texte" className="block text-sm font-medium text-gray-700">
                  Témoignage <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="texte"
                  name="texte"
                  required
                  minLength={10}
                  rows={4}
                  value={texte}
                  onChange={(e) => setTexte(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#E91E8C] focus:border-[#E91E8C] sm:text-sm"
                  placeholder="Décrivez votre expérience avec KPL SERVICES"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#E91E8C] hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E91E8C] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'submitting' ? 'Envoi en cours...' : 'Envoyer mon avis'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
