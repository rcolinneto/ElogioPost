// Formato oficial do link curto de avaliação do Google (o mesmo que a
// própria ferramenta "Receber mais avaliações" do Google Business Profile
// gera) — leva direto pra caixa de escrever avaliação daquele lugar.
export function googleReviewLink(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}
