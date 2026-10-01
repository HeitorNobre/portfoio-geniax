import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="eyebrow">Erro 404</p>
      <h1 className="mt-3 text-4xl font-bold">Página não encontrada</h1>
      <p className="mt-4 max-w-md text-lg text-ink-600">O endereço pode ter mudado. Volte para o início ou veja os cases demonstrativos.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/">Voltar ao início</Button>
        <Button href="/#cases" variant="secondary">
          Ver cases
        </Button>
      </div>
    </Container>
  );
}
