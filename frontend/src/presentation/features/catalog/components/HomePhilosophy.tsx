import { ArrowRight } from 'lucide-react';
import { LinkButton } from '../../../shared/components/LinkButton';
export function HomePhilosophy() {
  return (<div className="bg-zinc-950 dark:bg-[#1c1c20] text-white dark:text-zinc-100 rounded-3xl p-8 lg:p-16 border border-zinc-800 dark:border-zinc-700 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
    <div className="lg:col-span-7 space-y-4">
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 dark:text-amber-400 block">
        THINGS WORTH KEEPING / 01
      </span>
      <h2 className="font-serif-hero text-4xl sm:text-6xl text-white dark:text-zinc-100 leading-tight">
        For the rituals that make a room yours.
      </h2>
      <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 max-w-lg leading-relaxed">
        Every piece has a reason to be here. We look for honest materials, thoughtful makers, and objects that get better with use.
      </p>
    </div>
    <div className="lg:col-span-5 flex justify-end">
      <LinkButton
        to="/shop"
        variant="secondary"
        size="lg"
        className="shadow-xl"
        iconRight={<ArrowRight className="w-4 h-4" />}
      >
        Explore collection
      </LinkButton>
    </div>
  </div>);
}
