import { useImageColors } from "@/hooks/useImageColors";
import { apiAtom } from "@/providers/JellyfinProvider";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { Image, ImageProps, ImageSource } from "expo-image";
import { useAtom } from "jotai";
import { useMemo } from "react";

interface Props extends ImageProps {
  item: BaseItemDto;
  variant?: "Backdrop" | "Primary" | "Thumb" | "Logo";
  quality?: number;
  width?: number;
}

export const ItemImage: React.FC<Props> = ({
  item,
  variant,
  quality = 90,
  width = 1000,
  ...props
}) => {
  const [api] = useAtom(apiAtom);

  const source = useMemo(() => {
    if (!api) return null;

    let tag: string | null | undefined;
    let blurhash: string | null | undefined;
    let src: ImageSource | null = null;

    switch (variant) {
      case "Backdrop":
        if (item.Type === "Episode") {
          tag = item.ParentBackdropImageTags?.[0];
          if (!tag) break;
          blurhash = item.ImageBlurHashes?.Backdrop?.[tag];
          src = {
            uri: `${api.basePath}/Items/${item.ParentBackdropItemId}/Images/Backdrop/0?quality=${quality}&tag=${tag}`,
            blurhash,
          };
          break;
        }

        tag = item.BackdropImageTags?.[0];
        if (!tag) break;
        blurhash = item.ImageBlurHashes?.Backdrop?.[tag];
        src = {
          uri: `${api.basePath}/Items/${item.Id}/Images/Backdrop/0?quality=${quality}&tag=${tag}`,
          blurhash,
        };
        break;
      case "Primary":
        tag = item.ImageTags?.["Primary"];
        if (!tag) break;
        blurhash = item.ImageBlurHashes?.Primary?.[tag];

        src = {
          uri: `${api.basePath}/Items/${item.Id}/Images/Primary?quality=${quality}&tag=${tag}`,
          blurhash,
        };
        break;
      case "Thumb":
        tag = item.ImageTags?.["Thumb"];
        if (!tag) break;
        blurhash = item.ImageBlurHashes?.Thumb?.[tag];

        src = {
          uri: `${api.basePath}/Items/${item.Id}/Images/Backdrop?quality=${quality}&tag=${tag}`,
          blurhash,
        };
        break;
      default:
        tag = item.ImageTags?.["Primary"];
        src = {
          uri: `${api.basePath}/Items/${item.Id}/Images/Primary?quality=${quality}&tag=${tag}`,
        };
        break;
    }

    return src;
  }, [item.ImageTags]);

  useImageColors(source?.uri);

  return (
    <Image
      transition={300}
      placeholder={{
        blurhash: source?.blurhash,
      }}
      source={{
        uri: source?.uri,
      }}
      {...props}
    />
  );
};
