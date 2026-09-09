# DNS-AID de Lucas Gil Films

O registro em `ops/dns-aid.zone` anuncia o catálogo HTTPS existente em `/.well-known/ard.json`. O namespace `_index._agents` identifica o índice da organização. A seção 3.2 do draft deixa o formato desse catálogo fora do escopo de DNS-AID; usamos o ARD já publicado. Não se anunciam protocolos de servidor que o portfólio não oferece.

Registro: SVCB ServiceMode, prioridade 1, destino `lucasgilfilms.com`, ALPN `h2,http/1.1`, porta 443, parâmetros obrigatórios `alpn,port`. O parâmetro privado `key65400` contém a URL absoluta do catálogo e segue a convenção `cap` da implementação dns-aid-core. Cloudflare aceitou o parâmetro privado diretamente; não foi necessário usar TXT como alternativa. HTTP/2 foi confirmado no endpoint real.

DNSSEC requer duas partes: assinatura da zona no Cloudflare e registro DS correspondente no registrador, para estabelecer a cadeia de confiança desde `.com`. A existência de RRSIG sozinha não comprova essa cadeia. `node scripts/verify-dns-aid.mjs` só aprova quando os resolvedores Cloudflare e Google devolvem AD=true, encontram o DS esperado, resolvem site/e-mail e alcançam o catálogo e seus recursos.

O DS documentado é público e foi obtido do painel Cloudflare em 09/09/2026. Não o adicionar como um registro DS comum dentro de `lucasgilfilms.com`: deve ser configurado no registrador. Não alterar os servidores de nomes ou os registros de site/e-mail para realizar esta configuração.

O proprietário confirmou que o registrador também é Cloudflare. Nesse caso, o Cloudflare publica o DS automaticamente após a ativação do DNSSEC. O status só deve ser considerado concluído depois da verificação pública; o botão de ativação e as assinaturas RRSIG não bastam. A sessão disponível permitiu editar a zona DNS, mas a página de registros de domínio apresentou erro ao carregar.

Em máquinas com certificado corporativo confiável instalado no sistema, o Node pode precisar de `node --use-system-ca scripts/verify-dns-aid.mjs`. Isso usa o armazenamento de confiança do sistema, mantendo a verificação TLS habilitada. Não desabilitar a validação de certificados.

## Referências

- [Skill DNS-AID do scanner](https://isitagentready.com/.well-known/agent-skills/dns-aid/SKILL.md)
- [DNS-AID draft-02, seção 3.2](https://www.ietf.org/archive/id/draft-mozleywilliams-dnsop-dnsaid-02.html#section-3.2)
- [RFC 9460 — SVCB](https://www.rfc-editor.org/rfc/rfc9460.html)
- [Parâmetros privados da implementação dns-aid-core](https://github.com/dns-aid/dns-aid-core/security)
- [DNSSEC no Cloudflare](https://developers.cloudflare.com/dns/dnssec/)

O scanner independente aceita `POST https://isitagentready.com/api/scan` com `{"url":"https://lucasgilfilms.com"}`. O resultado relevante é `checks.discoverability.dnsAid`; registrar o status real, inclusive enquanto a delegação DNSSEC estiver pendente.
