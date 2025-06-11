import { Button, Link } from "@heroui/react";
import { GoSmiley } from "react-icons/go"

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl">hey</h1>
      <Button
        as={Link}
        href="/members"
        color="primary"
        variant="bordered"
        startContent={<GoSmiley size={20} />}
      >
        Click me
      </Button>
    </div>
  );
}