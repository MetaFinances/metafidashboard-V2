import { Combobox, ComboboxItem, ComboboxPopover, useComboboxState } from 'ariakit/combobox'
import TokenLogo from 'components/TokenLogo'
import { useRouter } from 'next/router'
import { transparentize } from 'polished'
import { useMemo } from 'react'
import styled from 'styled-components'
import { chainIconUrl, standardizeProtocolName, tokenIconUrl } from 'utils'
import Link from 'next/link'
import { AllTvlOptions } from 'components/SettingsModal'
import { ArrowRight, Search as SearchIcon, X as XIcon } from 'react-feather'
import { DeFiTvlOptions } from 'components/Select'
import { FixedSizeList } from 'react-window'

const Wrapper = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`

const Box = styled(Combobox)`
  padding: 14px 16px;
  padding-top: 16px;
  background: ${({ theme }) => theme.bg6};
  border: none;
  border-radius: 12px;
  outline: none;
  color: ${({ theme }) => theme.text1};
  font-size: 1rem;
  box-shadow: 0px 24px 32px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 0px 1px rgba(0, 0, 0, 0.04);

  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 1rem;
  }

  :focus-visible,
  [data-focus-visible] {
    outline: ${({ theme }) => '1px solid ' + theme.text4};
  }
`

const Popover = styled(ComboboxPopover)`
  height: 100%;
  max-height: 240px;
  overflow-y: auto;
  background: ${({ theme }) => theme.bg6};
  z-index: 100;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.04);

  ${({ theme: { minLg } }) => minLg} {
    max-height: 320px;
  }
`

const Item = styled(ComboboxItem)`
  padding: 12px 14px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text1};
  display: flex;
  align-items: center;
  gap: 4px;

  & > * {
    margin-right: 6px;
  }

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }

  &[data-active-item] {
    background-color: ${({ theme }) => theme.bg2};
  }
`

const Empty = styled.div`
  text-align: center;
  padding: 24px 12px;
  color: ${({ theme }) => theme.text1};
`

const OptionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  background: ${({ theme }) => transparentize(0.4, theme.bg6)};

  & > p {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    margin: 0;

    & > * {
      color: ${({ theme }) => theme.text1};
      font-size: 0.875rem;
    }
  }
`

const IconWrapper = styled.div`
  position: absolute;
  top: 14px;
  right: 16px;
  & > svg {
    color: ${({ theme }) => theme.text3};
    height: 20px;
    width: 20px;
  }
`

const Label = styled.label`
  color: ${({ theme }) => theme.text1};
  font-weight: 400;
  font-size: 0.75rem;
  opacity: 0.8;
  white-space: nowrap;
  display: none;
  gap: 8px;
  align-items: center;
  margin-left: auto;
  padding: 0 16px;

  ${({ theme: { min2Xl } }) => min2Xl} {
    display: flex;
  }
`

const DropdownOptions = styled(DeFiTvlOptions)`
  display: none;

  ${({ theme: { minLg } }) => minLg} {
    display: flex;
    padding: 0 4px;
  }

  ${({ theme: { min2Xl } }) => min2Xl} {
    display: none;
  }
`

interface IList {
  isChain: boolean
  logo: string
  name: string
}

interface ISearchProps {
  data: any
  loading?: boolean
  step?: { category: string; name: string }
}

export default function Search({ data, loading = false, step }: ISearchProps) {
  const searchData: IList[] = useMemo(() => {
    const chainData: IList[] =
      data?.chains?.map((name) => ({
        logo: chainIconUrl(name),
        isChain: true,
        name,
      })) ?? []

    return [...(data?.protocols?.map((token) => ({ ...token, logo: tokenIconUrl(token.name) })) ?? []), ...chainData]
  }, [data])

  const combobox = useComboboxState({ gutter: 8, sameWidth: true, list: searchData.map((x) => x.name) })

  // Resets combobox value when popover is collapsed
  if (!combobox.mounted && combobox.value) {
    combobox.setValue('')
  }

  return (
    <Wrapper>
      <Box
        state={combobox}
        placeholder="Search..."
        style={step && { borderBottomLeftRadius: '0', borderBottomRightRadius: 0 }}
      />

      <IconWrapper>{combobox.mounted ? <XIcon /> : <SearchIcon />}</IconWrapper>

      {step && <Options step={step} />}

      {/* TODO make auto resizing work */}
      <Popover state={combobox}>
        {loading || !combobox.mounted ? (
          <Empty>Loading...</Empty>
        ) : combobox.matches.length ? (
          <FixedSizeList
            height={240}
            width="100%"
            itemCount={combobox.matches.length}
            itemSize={50}
            itemData={{ searchData, options: combobox.matches }}
          >
            {Row}
          </FixedSizeList>
        ) : (
          <Empty>No results found</Empty>
        )}
      </Popover>
    </Wrapper>
  )
}

// Virtualized Row
const Row = ({ index, style, data }) => {
  const { searchData, options } = data

  const value = options[index]

  const item = searchData.find((x) => x.name === value)

  const router = useRouter()
  const to = item.isChain ? `/chain/${value}` : `/protocol/${standardizeProtocolName(value)}`

  return (
    <Item key={value} value={value} onClick={() => router.push(to)} style={style}>
      <TokenLogo logo={item.logo} />
      <span>{value}</span>
    </Item>
  )
}

const Options = ({ step }) => {
  return (
    <OptionsWrapper>
      <p>
        <Link href={`/${step.category.toLowerCase()}`}>{step.category}</Link>
        <ArrowRight size={16} />
        <span style={{ color: step.color }}>{step.name}</span>
      </p>

      {/* below components will render base on breakpoint */}
      <DropdownOptions />

      <Label>
        <span>INCLUDE IN TVL</span>
        <AllTvlOptions style={{ display: 'flex', justifyContent: 'flex-end', margin: 0, fontSize: '0.875rem' }} />
      </Label>
    </OptionsWrapper>
  )
}
