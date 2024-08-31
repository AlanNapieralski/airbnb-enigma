const roundTo = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

const input = (total, payer, guests) => {

  const perShare = total / guests.reduce((acc, guest) => acc += guest.share, 0)

  const newArr = guests.map(({ name, paid, share }) => ({
    name,
    toPay: roundTo(share * perShare),
    paid,
    share
  })
  )

  const actualTotal = newArr.reduce((acc, obj) => acc += obj.toPay, 0)
  return newArr.map(guest => guest.name === payer ? { ...guest, paid: actualTotal } : guest)
}


export const calcWhenPaid = (people) => {

  const peopleAfterPaid = people.map(person => {
    person.toPay = roundTo(person.toPay - person.paid)
    return person
  }).sort((a, b) => a.toPay - b.toPay)

  const payer = peopleAfterPaid[0];

  payer.toPay = roundTo(peopleAfterPaid.reduce((acc, person) => {
    if (person !== payer) {
      return roundTo(acc + person.paid);
    }
    return payer.toPay;
  }, payer.toPay));

  return peopleAfterPaid;
}


export const normalize = (people) => {

  const deptArray = []
  const peopleOnNegative = people.filter(person => person.toPay < 0).sort((a, b) => a.toPay - b.toPay)
  const peopleOnPositive = people.filter(person => person.toPay > 0).sort((a, b) => b.toPay - a.toPay)

  let i = 0;
  let y = 0;

  while (i < peopleOnNegative.length || y < peopleOnPositive.length) {
    const negativePerson = peopleOnNegative[i];
    const positivePerson = peopleOnPositive[y];

    const debt = roundTo(Math.abs(negativePerson.toPay))
    const payer = roundTo(positivePerson.toPay)

    if (roundTo(debt) === roundTo(payer)) {
      negativePerson.toPay = 0;
      positivePerson.toPay = 0;
      deptArray.push({ payer: positivePerson.name, payee: negativePerson.name, amount: debt })

      i++;
      y++;

    } else if (roundTo(debt) < roundTo(payer)) {
      negativePerson.toPay = 0;
      positivePerson.toPay = roundTo(positivePerson.toPay) - debt;
      deptArray.push({ payer: positivePerson.name, payee: negativePerson.name, amount: debt })

      i++;

    } else if (roundTo(debt) > roundTo(payer)) {
      negativePerson.toPay = roundTo(negativePerson.toPay) + payer
      positivePerson.toPay = 0;
      deptArray.push({ payer: positivePerson.name, payee: negativePerson.name, amount: payer })

      y++;

    } else {
      console.error('kurwa')
    }

  }

  return deptArray
}

const outputHumanData = (data) => {
  data.reduce((prev, current) => {
    if (prev !== current.payer) {
      console.log('')
      console.log(current.payer + ' needs to pay: ')
      console.log('- ' + current.payee + ' £' + current.amount)
      return current.payer

    } else if (prev === current.payer) {
      console.log('- ' + current.payee + ' £' + current.amount)
      return prev
    }
  }, '')

  console.log('')
}

// program running

const people = [
  { name: 'Harry', paid: 301.18, share: 3 },
  { name: 'Luke', paid: 45.84, share: 3 },
  { name: 'Laura', paid: 45.84, share: 3 },
  { name: 'Gaba', paid: 45.84, share: 3 },
  { name: 'Ines', paid: 45.84, share: 3 },
  { name: 'Aron', paid: 45.84, share: 3 },
  { name: 'Alvaro', paid: 12.57, share: 1 },
  { name: 'Lila', paid: 12.57, share: 1 },
  { name: 'Adrian', paid: 0, share: 1 },
  { name: 'Alan', paid: 0, share: 2 },
  { name: 'Pawel', paid: 0, share: 3 }
]

const data = input(301.18, 'Harry', people)
const calculatedToPay = calcWhenPaid(data)
const result = normalize(calculatedToPay)

outputHumanData(result)
