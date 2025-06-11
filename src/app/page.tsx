import { Button, Link } from "@heroui/react";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl">hey</h1>
      <Button
        as={Link}
        href="/members"
        color="primary"
        variant="bordered"
      >
        Click me
      </Button>
    </div>
  );
}