import { world, system, CommandPermissionLevel, CustomCommandStatus } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const PREFIX = "§8[§bMGHK§8] §r";
const players = new Map();
const features = [
  ["xray", "X-Ray • contorno de minérios", false],
  ["esp", "ESP de entidades", true],
  ["speed", "Speed", true],
  ["fly", "Fly livre", false],
  ["noclip", "NoClip", false],
  ["aura", "Aura / KillAura", false],
  ["range", "Aura Range", false],
  ["hitbox", "Hitbox Expander", false],
  ["trigger", "Trigger Bot", false],
  ["fullbright", "FullBright", false],
  ["cave", "Avisos de exploração", true]
];

function state(p) {
  if (!players.has(p.id)) {
    const flags = {};
    for (const [id] of features) flags[id] = false;
    players.set(p.id, { flags, radius: 24, hints: true });
  }
  return players.get(p.id);
}
function say(p, text) { try { p.sendMessage(PREFIX + text); } catch {} }
function cmdResult(ok, message) {
  return { status: ok ? CustomCommandStatus.Success : CustomCommandStatus.Failure, message };
}
function fromOrigin(origin) {
  const e = origin?.sourceEntity;
  return e?.typeId === "minecraft:player" ? e : undefined;
}
function register(registry, command, description, callback) {
  registry.registerCommand({
    name: "mghk:" + command,
    description,
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false
  }, callback);
}
function applyEsp(p) {
  const s = state(p);
  for (const e of p.dimension.getEntities({ location: p.location, maxDistance: s.radius })) {
    if (e.id === p.id || e.typeId === "minecraft:item" || e.typeId === "minecraft:xp_orb") continue;
    try { e.addEffect("glowing", 60, { showParticles: false }); } catch {}
  }
}
async function openMenu(p) {
  const s = state(p);
  const form = new ActionFormData()
    .title("§l§bMGHK CLIENT §7v1.2")
    .body("§7Todas as funções em uma única UI. Toque para alternar.\n§aON §7/ §cOFF\n§8Alguns recursos exigem um cliente modificado e ficam informativos.");
  for (const [id, label, supported] of features) {
    form.button((s.flags[id] ? "§a[ON] " : "§c[OFF] ") + "§f" + label + (supported ? "" : " §8• indisponível no addon"));
  }
  form.button("§bConfigurações");
  form.button("§cFechar");
  let r;
  try { r = await form.show(p); } catch { return; }
  if (r.canceled || r.selection === undefined) return;
  if (r.selection < features.length) {
    const [id, label, supported] = features[r.selection];
    if (!supported) {
      say(p, label + ": a Script API normal do Bedrock não fornece esta função como hack de cliente. O botão não a ativa.");
      return openMenu(p);
    }
    s.flags[id] = !s.flags[id];
    if (id === "speed" && !s.flags.speed) { try { p.removeEffect("speed"); } catch {} }
    if (id === "esp" && s.flags.esp) applyEsp(p);
    say(p, label + " " + (s.flags[id] ? "ativado" : "desativado") + ".");
    return openMenu(p);
  }
  if (r.selection === features.length) {
    const modal = new ModalFormData()
      .title("MGHK • Configurações")
      .textField("Alcance do ESP (8–64 blocos)", "24", String(s.radius))
      .toggle("Mostrar mensagens de status", s.hints);
    try {
      const cfg = await modal.show(p);
      if (!cfg.canceled) {
        s.radius = Math.max(8, Math.min(64, Number(cfg.formValues?.[0]) || 24));
        s.hints = Boolean(cfg.formValues?.[1]);
        say(p, "Alcance do ESP: " + s.radius + " blocos.");
      }
    } catch {}
    return openMenu(p);
  }
}
system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
  register(customCommandRegistry, "open", "Abre o menu do MGHK Client.", origin => {
    const p = fromOrigin(origin);
    if (!p) return cmdResult(false, "Execute dentro de um mundo como jogador.");
    system.run(() => openMenu(p));
    return cmdResult(true, "Abrindo MGHK Client...");
  });
  register(customCommandRegistry, "help", "Mostra a ajuda do MGHK Client.", origin => {
    const p = fromOrigin(origin);
    if (!p) return cmdResult(false, "Execute dentro de um mundo como jogador.");
    system.run(() => say(p, "Use /mghk:open para abrir o menu. Esta versão implementa Speed e ESP de entidades; outras funções são informativas."));
    return cmdResult(true, "Ajuda enviada.");
  });
});
system.runInterval(() => {
  for (const p of world.getAllPlayers()) {
    const s = state(p);
    if (s.flags.speed) { try { p.addEffect("speed", 80, { amplifier: 1, showParticles: false }); } catch {} }
    if (s.flags.esp) applyEsp(p);
    if (s.flags.cave && Math.random() < 0.015) {
      try { p.onScreenDisplay.setActionBar("§eMGHK §7• Observe o terreno antes de avançar."); } catch {}
    }
  }
}, 40);
