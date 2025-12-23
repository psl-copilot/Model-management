import { Typography, styled, type Theme, type TypographyProps } from '@mui/material';
import { baseFontSizes } from '../../utils/Constants';

type VariantKey = keyof typeof baseFontSizes;

interface TextProps extends Omit<TypographyProps, 'variant'> {
    variant: VariantKey;
}

export const Text = styled(({ variant, ...props }: TextProps) => (
    <Typography {...props} />
))<TextProps>(({ theme, variant }: { theme: Theme; variant: VariantKey }) => ({
    fontSize: baseFontSizes[variant].default,
    [theme.breakpoints.down('sm')]: {
        fontSize: baseFontSizes[variant].small,
    },
}));
