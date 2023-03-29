import { isUUID, registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export const IsUUIDOrSelf = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isUUIDOrSelf',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        ...validationOptions,
        message: `value must be an UUID or the literal 'self'`,
      },
      validator: {
        validate(value: any, _?: ValidationArguments) {
          return typeof value === 'string' && (isUUID(value) || value === 'self');
        },
      },
    });
  };
};
