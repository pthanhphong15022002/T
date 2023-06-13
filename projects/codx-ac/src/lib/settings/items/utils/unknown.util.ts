export enum EntityName {
  IV_ItemsSizes = 'IV_ItemsSizes',
  IV_ItemsColors = 'IV_ItemsColors',
  IV_ItemsStyles = 'IV_ItemsStyles',
}

export function getClassName(entityName: string) {
  return entityName.split('_')[1] + 'Business';
}
