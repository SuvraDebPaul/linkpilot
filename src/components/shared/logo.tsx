import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex flex-col items-center gap-2">
      <Image
        src={"/logo.png"}
        alt="LinkPilot"
        width={200}
        height={100}
        className="h-10 w-auto"
      />
    </Link>
  );
}
