import { ArrowRight } from 'lucide-react';
import { LinkButton } from '../../../shared/components/LinkButton';
export function HomeHero() {
  return (<div className="relative border-b border-zinc-200 dark:border-zinc-800 pb-16 pt-6">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
      <div className="lg:col-span-8 space-y-6">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 block">
          Onda / noun / wave, flow, feeling
        </span>

        <h1 className="font-serif-hero text-5xl sm:text-7xl lg:text-8xl leading-[0.92] text-zinc-950 dark:text-zinc-100 tracking-[-0.03em]">
          The everyday, edited with a pulse.
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl font-sans leading-relaxed">
          Onda is a quiet collection of useful things — chosen for the way they feel in your hand, and the way they stay in your life.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <LinkButton
            to="/shop"
            variant="primary"
            size="md"
            className="shadow-md"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Shop the edit
          </LinkButton>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-4 bg-zinc-100/80 dark:bg-[#1c1c20] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
          SELECTED / 01
        </span>
        <p className="text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed italic font-serif text-lg">
          "We believe a well-made object can change the temperature of a day. The weight of a cup. The drag of a pencil."
        </p>
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-500">
          <span>Selected objects</span>
          <span className="font-bold text-zinc-950 dark:text-zinc-100">2026 Edit</span>
        </div>
      </div>
    </div>
  </div>);
}
