interface TimeInfo {
  creationTime?: Date;
  expires?: boolean;
  expiryTime?: Date;
  lastAccessTime?: Date;
  lastModificationTime?: Date;
  locationChanged?: Date;
  usageCount?: number;
}

export default TimeInfo;
