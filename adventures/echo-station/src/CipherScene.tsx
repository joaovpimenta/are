import * as stylex from '@stylexjs/stylex';
import { CipherRotor3D } from '@are/engine/components/cipher/CipherRotor3D';
import { stepCipherRotor } from '@are/engine/mechanisms/cipher';
import { HardwareStage } from './HardwareStage';
import { echoScenario, echoTheme } from './scenario';
import { echoStyles } from './styles';

type CipherSceneProps = {
  values: readonly number[];
  solved: boolean;
  onChange: (values: readonly number[], solved: boolean) => void;
  onComplete: () => void;
};

export default function CipherScene({ values, solved, onChange, onComplete }: CipherSceneProps) {
  const stepRotor = (index: number, direction: number) => {
    const next = stepCipherRotor({ values, solved }, index, direction, echoScenario.cipher);
    onChange(next.values, next.solved);
  };
  return (
    <div {...stylex.props(echoStyles.content)}>
      <aside {...stylex.props(echoStyles.panel)} aria-label="Controles do decodificador">
        <p {...stylex.props(echoStyles.eyebrow)}>Chave do arquivo</p>
        <p {...stylex.props(echoStyles.instruction)}>Use + e − ou as setas no objeto para ajustar cada rotor. Leia os números da esquerda para a direita.</p>
        <div {...stylex.props(echoStyles.rotors)}>
          {values.map((value, index) => (
            <div {...stylex.props(echoStyles.rotor)} key={index}>
              <span>Rotor {index + 1}</span>
              <button {...stylex.props(echoStyles.button)} type="button" disabled={solved} aria-label={`Aumentar rotor ${index + 1}`} onClick={() => stepRotor(index, 1)}>+</button>
              <output {...stylex.props(echoStyles.readout)} aria-label={`Rotor ${index + 1}`}>{value}</output>
              <button {...stylex.props(echoStyles.button)} type="button" disabled={solved} aria-label={`Diminuir rotor ${index + 1}`} onClick={() => stepRotor(index, -1)}>−</button>
            </div>
          ))}
        </div>
        <p {...stylex.props(echoStyles.status, solved ? echoStyles.success : undefined)} role="status">{solved ? 'Chave aceita. Arquivo pronto para restaurar.' : 'Ajustando chave. Consulte os três ecos na transmissão.'}</p>
        <button {...stylex.props(echoStyles.button, echoStyles.primary)} type="button" disabled={!solved} onClick={onComplete}>Restaurar arquivo</button>
      </aside>
      <HardwareStage label="Decodificador de rotores da Echo Station">
        <CipherRotor3D values={values} solution={echoScenario.cipher} theme={echoTheme} disabled={solved} onStep={stepRotor} />
      </HardwareStage>
    </div>
  );
}
