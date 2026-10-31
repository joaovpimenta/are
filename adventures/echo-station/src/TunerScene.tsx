import * as stylex from '@stylexjs/stylex';
import { Tuner3D } from '@are/engine/components/tuner/Tuner3D';
import { stepDialValue } from '@are/engine/mechanisms/dial';
import { HardwareStage } from './HardwareStage';
import { echoScenario, echoTheme } from './scenario';
import { echoStyles } from './styles';

type TunerSceneProps = {
  reducedMotion: boolean;
  frequency: number;
  solved: boolean;
  onChange: (value: number) => void;
  onComplete: () => void;
};

export default function TunerScene({ reducedMotion, frequency, solved, onChange, onComplete }: TunerSceneProps) {
  return (
    <div {...stylex.props(echoStyles.content)}>
      <aside {...stylex.props(echoStyles.panel)} aria-label="Controles do rádio">
        <p {...stylex.props(echoStyles.eyebrow)}>Sintonia da portadora</p>
        <p {...stylex.props(echoStyles.instruction)}>Arraste o botão do rádio como um relógio ou use a barra e os botões abaixo. As setas do teclado também ajustam a barra.</p>
        <div {...stylex.props(echoStyles.controls)}>
          <button {...stylex.props(echoStyles.button)} type="button" disabled={solved} aria-label="Diminuir frequência" onClick={() => onChange(stepDialValue(frequency, -1, { min: 0, max: 99 }))}>−</button>
          <output {...stylex.props(echoStyles.readout)} aria-label="Frequência atual">{String(frequency).padStart(2, '0')}</output>
          <button {...stylex.props(echoStyles.button)} type="button" disabled={solved} aria-label="Aumentar frequência" onClick={() => onChange(stepDialValue(frequency, 1, { min: 0, max: 99 }))}>+</button>
          <input {...stylex.props(echoStyles.slider)} type="range" min="0" max="99" value={frequency} disabled={solved} aria-label="Frequência do rádio" onChange={(event) => onChange(Number(event.currentTarget.value))} />
        </div>
        <p {...stylex.props(echoStyles.status, solved ? echoStyles.success : undefined)} role="status">{solved ? 'Sinal estabilizado. Decodificador liberado.' : 'Buscando sinal. Consulte a banda no registro de pistas.'}</p>
        <button {...stylex.props(echoStyles.button, echoStyles.primary)} type="button" disabled={!solved} onClick={onComplete}>Abrir decodificador</button>
      </aside>
      <HardwareStage label="Rádio de ondas curtas da Echo Station">
        <Tuner3D value={frequency} target={echoScenario.targetBand} theme={echoTheme} reducedMotion={reducedMotion} disabled={solved} onChange={onChange} />
      </HardwareStage>
    </div>
  );
}
