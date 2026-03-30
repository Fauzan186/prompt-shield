interface AnimatedBackgroundProps {
  variant?: 'landing' | 'app';
}

export const AnimatedBackground = ({ variant = 'landing' }: AnimatedBackgroundProps) => {
  const isLanding = variant === 'landing';

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(244,63,94,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(180deg,_rgba(2,6,23,0.72),_rgba(2,6,23,0.96))]" />
      <div className="pulse-grid absolute inset-0 bg-grid-fade bg-[size:44px_44px] opacity-60" />
      <div className={`scan-lines absolute inset-0 ${isLanding ? 'opacity-20' : 'opacity-14'}`} />
      <div className="absolute inset-0">
        <div className={`orb orb-one left-[-90px] top-14 h-72 w-72 bg-orange-400/16 ${isLanding ? '' : 'opacity-70'}`} />
        <div className={`orb orb-two right-[-80px] top-1/4 h-80 w-80 bg-rose-500/16 ${isLanding ? '' : 'opacity-65'}`} />
        <div className={`orb orb-three bottom-10 left-1/4 h-56 w-56 bg-cyan-400/16 ${isLanding ? '' : 'opacity-60'}`} />
        {isLanding ? (
          <>
            <div className="orb orb-four right-1/4 top-20 h-44 w-44 bg-amber-400/12" />
            <div className="orb orb-five bottom-24 right-1/3 h-64 w-64 bg-red-500/12" />
          </>
        ) : null}
      </div>
      <div className="neural-lines absolute inset-0 overflow-hidden">
        <span className="neural-line left-[8%] top-[18%] w-48 rotate-12" />
        <span className="neural-line left-[58%] top-[14%] w-60 -rotate-6" />
        <span className="neural-line left-[20%] top-[62%] w-72 rotate-[18deg]" />
        <span className="neural-line left-[64%] top-[70%] w-52 -rotate-[15deg]" />
      </div>
    </>
  );
};
