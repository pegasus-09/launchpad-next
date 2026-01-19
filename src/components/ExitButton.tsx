import Link from "next/link"

type Props = {
    side: "left" | "right"
}

export default function ExitButton({ side }: Props) {
    return (
        <Link href="/" className={`m-8 text-3xl hover:brightness-90 text-${side === "left" ? "white" : "violet-500"} absolute`}>X</Link>
    )
}