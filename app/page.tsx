import { Compress } from "@/components/Compress";
import { Header } from "@/components/Header";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Header />
      <Compress />
    </main>
  );
}
