import { ChangeEvent } from 'react';
import Button from '@mui/material/Button';

export type PickedFile = { name: string; type: string; size: number; dataUrl: string };

async function fileToDataUrl(file: File): Promise<PickedFile> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  return { name: file.name, type: file.type, size: file.size, dataUrl };
}

export default function FilePicker({
  label,
  multiple,
  onPicked,
}: {
  label: string;
  multiple?: boolean;
  onPicked: (files: PickedFile[]) => void;
}) {
  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const picked = await Promise.all(files.map(fileToDataUrl));
    onPicked(picked);
    e.target.value = '';
  }

  return (
    <Button component="label" variant="outlined">
      {label}
      <input hidden type="file" multiple={multiple} onChange={onChange} />
    </Button>
  );
}
