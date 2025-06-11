'use client';
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    Button
} from "@heroui/react";
import Link from "next/link";
import React from "react";
import brain from "./../../public/tinybrain.png";

export default function TopNav() {
    return (
        <Navbar
            maxWidth="full"
            className="bg-[oklch(66.64%_0.0437_194.23)]"
            classNames={{
                item: [
                    "text-xl",
                    "text-white",
                    "uppercase",
                    "data-[active=true]:text-yellow-200"
                ],
            }}
        >
            <NavbarBrand as={Link} href="/">
                <img src="/tinybrain.png" alt="Tiny Brain Logo" style={{ width: '40px', height: '40px' }} />
                <div className="font-bold text-3xl flex">
                    <span className="text-gray-200">
                        NUSing my Brain
                    </span>
                </div>
            </NavbarBrand>
            <NavbarContent justify="center">
                <NavbarItem>
                    <Link href="/members">
                        Tutors
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link href="/lists">
                        Calendar
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link href="/messages">
                        Messages
                    </Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
                <Button
                    as={Link}
                    href="/auth/login"
                    variant="bordered"
                    className="text-white"
                >
                    Login
                </Button>
                <Button
                    as={Link}
                    href="/auth/register"
                    variant="bordered"
                    className="text-white"
                >
                    Register
                </Button>
            </NavbarContent>
        </Navbar>
    );
}