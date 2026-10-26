# MGHK Client — Bedrock Android

Projeto experimental de addon com uma única interface, inspirada em menus de clientes de Minecraft.

## Comandos
- `/mghk:open` — abre a UI com todas as funções.
- `/mghk:help` — mostra a ajuda.

## Recursos que funcionam no addon
- **Speed**: aplica efeito de velocidade.
- **ESP de entidades**: usa o efeito glowing em entidades próximas.
- **Avisos de exploração**: mostra lembretes ocasionais.
- **Configurações**: raio do ESP e mensagens de status.

## Itens exibidos, mas ainda não implementados
X-Ray com contorno de minérios, Fly livre, NoClip, Aura/KillAura, Aura Range, Hitbox Expander, Trigger Bot e FullBright de cliente exigem APIs de renderização ou modificação do cliente que um addon comum não oferece. Os botões explicam essa limitação, sem fingir que o recurso está funcionando.

## Instalação
1. Importe os pacotes Behavior e Resources no Minecraft Bedrock.
2. Ative ambos no mundo.
3. Digite `/mghk:open`.

**Compatibilidade:** depende de uma versão do Bedrock que suporte Custom Commands e as dependências Script API declaradas no manifest. Ainda precisa ser testado no jogo real.
