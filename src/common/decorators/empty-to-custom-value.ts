import { Transform } from 'class-transformer';

export const EmptyToCustomValue = (customValue: any = undefined) => Transform(({ value }) => value === '' ? customValue : value);
