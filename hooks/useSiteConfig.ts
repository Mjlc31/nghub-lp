import { useSiteConfig as useSiteConfigContext } from '../context/SiteConfigContext';

export {
  SiteConfigProvider,
  useSiteColors,
  useSiteTexts,
  useSiteImages
} from '../context/SiteConfigContext';

export const useSiteConfig = () => {
  const context = useSiteConfigContext();
  return {
    ...context,
    setConfig: context.updateConfig
  };
};
