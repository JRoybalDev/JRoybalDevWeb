import React from 'react';

interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string; // The original Cloudinary URL
  alt: string;
  // Optional transformations string, e.g., "w_600,h_400,c_fill,g_auto,q_auto,f_auto"
  // If not provided, a default set of transformations will be applied.
  transformations?: string;
}

const DEFAULT_TRANSFORMATIONS = "w_600,h_400,c_fill,g_auto,q_auto,f_auto";

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  transformations,
  ...rest
}) => {
  const getTransformedUrl = (originalUrl: string, customTransformations?: string) => {
    if (!originalUrl || !originalUrl.includes('res.cloudinary.com')) {
      return originalUrl; // Not a Cloudinary URL, return as is
    }

    const appliedTransformations = customTransformations || DEFAULT_TRANSFORMATIONS;
    return originalUrl.replace('/upload/', `/upload/${appliedTransformations}/`);
  };

  const transformedSrc = getTransformedUrl(src, transformations);

  return (
    <img src={transformedSrc} alt={alt} {...rest} />
  );
};

export default CloudinaryImage;