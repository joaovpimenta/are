import * as stylex from '@stylexjs/stylex';
import { InventoryPanel } from '@are/engine/components/inventory/InventoryPanel';
import { useEffect, useMemo } from 'react';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';

const artifacts = [
  { id: 'brass-key', label: 'Chave de latão', description: 'Pequena, pesada e marcada com E-7.', symbol: '⌁' },
  { id: 'film-reel', label: 'Rolo de filme', description: 'A etiqueta registra a banda 73.', symbol: '◉' },
  { id: 'blueprint', label: 'Planta dobrada', description: 'Mostra quatro símbolos e dois eixos.', symbol: '▧' },
] as const;

export function InventoryRoute({ entry, theme, session, snapshot }: LabRouteProps) {
  const items = useMemo(() => artifacts.map((artifact) => ({
    ...artifact,
    collected: snapshot.inventory.includes(artifact.id),
  })), [snapshot.inventory]);

  useEffect(() => {
    if (snapshot.inventory.length >= artifacts.length) {
      session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'inventory' });
    }
  }, [session, snapshot.inventory.length]);

  const status = snapshot.mechanismResults.inventory ?? 'pending';
  return (
    <MechanismPage
      entry={entry}
      status={status}
      visual={<div {...stylex.props(labStyles.domStage)}><InventoryPanel items={items} selectedId={snapshot.selectedArtifactId} theme={theme} onSelect={(item) => { session.send({ type: 'ARTIFACT_COLLECTED', artifactId: item.id }); session.send({ type: 'ARTIFACT_SELECTED', artifactId: item.id }); }} /></div>}
      telemetry={<span>inventário=[{snapshot.inventory.join(', ')}]</span>}
    />
  );
}
