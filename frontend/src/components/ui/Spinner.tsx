import { Loader2 } from 'lucide-react';

export default function Spinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <Loader2 size={32} className="animate-spin mb-3" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
