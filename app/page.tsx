import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Welcome to&nbsp;</span>
        <br />
        <span className={title()}>
          NUSing My Brain
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          Are you a student or peer tutor?
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({
            radius: "full",
            variant: "shadow",
          })}
          href="/modules"
        >
          Student
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "shadow", radius: "full" })}
          href="/profile"
        >
          Peer tutor
        </Link>
      </div>
      
    </section>
  );
}
