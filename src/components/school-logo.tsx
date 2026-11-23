import Image from "next/image";
import crest from "@/assets/school-crest.png";

const SCHOOL = "I.E.P. Simón Bolívar";

/** Large school identity, only for the welcome screen. */
export function SchoolBanner() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="card grid place-items-center rounded-3xl bg-white p-3">
        <Image src={crest} alt="" width={132} height={120} preload />
      </span>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-muted">
          Institución Educativa Pública
        </p>
        <p className="text-3xl font-black leading-tight text-[#b3202a]">
          “Simón Bolívar”
        </p>
        <p className="text-sm font-bold text-muted">
          Santa Eulalia – Huarochirí
        </p>
      </div>
    </div>
  );
}

/** Small, faded school crest for the top corner of every other screen. */
export function SchoolMark() {
  return (
    <Image
      src={crest}
      alt={SCHOOL}
      title={SCHOOL}
      width={31}
      height={28}
      className="pointer-events-none shrink-0 select-none opacity-60"
    />
  );
}
