export default function setupCounter(element) {
  const target = element
  let counter = 0

  const setCounter = (count) => {
    counter = count
    target.innerHTML = `count is ${counter}`
  }

  target.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
