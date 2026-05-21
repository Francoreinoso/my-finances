import { useToasts } from '@/stores/useToasts';

describe('useToasts', () => {
  beforeEach(() => {
    useToasts.setState({ toasts: [] });
  });

  it('notify agrega un toast, con tono "success" por defecto', () => {
    useToasts.getState().notify('Bucket creado');
    const { toasts } = useToasts.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ message: 'Bucket creado', tone: 'success' });
  });

  it('notify acepta un tono explícito', () => {
    useToasts.getState().notify('Algo falló', 'error');
    expect(useToasts.getState().toasts[0]?.tone).toBe('error');
  });

  it('asigna un id distinto a cada toast', () => {
    const { notify } = useToasts.getState();
    notify('uno');
    notify('dos');
    const [a, b] = useToasts.getState().toasts;
    expect(a?.id).toBeDefined();
    expect(a?.id).not.toBe(b?.id);
  });

  it('dismiss elimina únicamente el toast indicado', () => {
    const { notify } = useToasts.getState();
    notify('uno');
    notify('dos');
    const [first] = useToasts.getState().toasts;
    useToasts.getState().dismiss(first?.id ?? '');
    const { toasts } = useToasts.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe('dos');
  });
});
