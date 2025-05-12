export default (xml) => {
  const parser = new DOMParser()
  const parsed = parser.parseFromString(xml, 'application/xml')
  const parserError = parsed.querySelector('parsererror')
  if (parserError) {
    throw new Error('ParsingError')
  }

  const feed = {
    title: parsed.querySelector('channel > title')?.textContent ?? '',
    description: parsed.querySelector('channel > description')?.textContent ?? '',
  }

  const items = [...parsed.querySelectorAll('item')]
  const posts = items.map(item => ({
    title: item.querySelector('title')?.textContent ?? '',
    link: item.querySelector('link')?.textContent ?? '',
    description: item.querySelector('description')?.textContent ?? '',
  }))

  return { feed, posts }
}
