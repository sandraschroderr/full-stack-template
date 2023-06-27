import styled from 'styled-components';
import { t } from '@lingui/macro';
import { HiOutlineGlobe } from 'react-icons/hi';

import { useI18n, Locale, LOCALE_LABEL } from '~services/i18n';
import { MenuButton, Stack, Text, Icon } from '~uikit';

export default function LangMenuButton() {
  const { i18n, changeLocale } = useI18n();

  return (
    <Wrapper
      label={t`Change locale`}
      onAction={(locale: Locale) => changeLocale(locale)}
      actions={Object.keys(LOCALE_LABEL).map((locale: Locale) => ({
        action: locale,
        label: LOCALE_LABEL[locale],
      }))}
    >
      <Stack axis="x" spacing="xxsmall" align="center">
        <Icon icon={HiOutlineGlobe} size={16} color="muted1" />
        <Text variant="bodySmall" color="muted1">
          {i18n.locale.toUpperCase()}
        </Text>
      </Stack>
    </Wrapper>
  );
}

const Wrapper = styled(MenuButton)`
  width: auto;
  height: auto;
  padding: ${p => p.theme.spacing.small}px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radii.small}px;
`;
