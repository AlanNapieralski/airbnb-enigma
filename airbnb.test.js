import { expect } from 'chai';
import { calcWhenPaid, normalize } from './airbnb.js'

const errorMessage = (expectedOutput, result) => ` Test failed!
  Expected output:
  ${JSON.stringify(expectedOutput, null, 2)}, 

  but got:
  ${JSON.stringify(result, null, 2)}
`

describe('CalcWhenPaid function', () => {
  it('should handle "Happy path" where everyone is paying how much they need to be paying', () => {

    const people = [
      { name: 'Harry', toPay: 75, paid: 300 },
      { name: 'Luke', toPay: 75, paid: 75 },
      { name: 'Laura', toPay: 75, paid: 75 },
      { name: 'Alan', toPay: 75, paid: 75 }
    ];

    const expectedOutput = [
      { name: 'Harry', toPay: 0, paid: 300 },
      { name: 'Luke', toPay: 0, paid: 75 },
      { name: 'Laura', toPay: 0, paid: 75 },
      { name: 'Alan', toPay: 0, paid: 75 }
    ];

    const result = calcWhenPaid(people)


    try {
      expect(result).to.deep.include.members(expectedOutput)
    } catch (err) {
      throw new Error(errorMessage(expectedOutput, result));
    }
  })

  // it('should handle Happy path with decimals', () => {
  //
  //   const people = [
  //     { name: 'Harry', toPay: 45.84, paid: 300.18 },
  //     { name: 'Luke', toPay: 45.84, paid: 45.84 },
  //     { name: 'Laura', toPay: 45.84, paid: 45.84 },
  //     { name: 'Gaba', toPay: 45.84, paid: 45.84 },
  //     { name: 'Ines', toPay: 45.84, paid: 45.84 },
  //     { name: 'Aron', toPay: 45.84, paid: 45.84 },
  //     { name: 'Alvaro', toPay: 12.57, paid: 12.57 },
  //     { name: 'Lila', toPay: 12.57, paid: 12.57 },
  //   ]
  //
  //   const expectedOutput = [
  //     { name: 'Harry', toPay: 0, paid: 286 },
  //     { name: 'Luke', toPay: 0, paid: 42.9 },
  //     { name: 'Laura', toPay: 0, paid: 42.9 },
  //     { name: 'Gaba', toPay: 0, paid: 42.9 },
  //     { name: 'Ines', toPay: 0, paid: 42.9 },
  //     { name: 'Aron', toPay: 0, paid: 42.9 },
  //     { name: 'Alvaro', toPay: 0, paid: 14.3 },
  //     { name: 'Lila', toPay: 0, paid: 14.3 }
  //   ]
  //
  //   const result = calcWhenPaid(people)
  //
  //   try {
  //     deep(include).include.include.include.members(expectedOutput)
  //   } catch (err) {
  //     throw new Error(errorMessage(expectedOutput, result));
  //   }
  // })

  it('should make the payers indebted to the accommodation payer if not paid enough', () => {
    const people = [
      { name: 'Harry', toPay: 75, paid: 300 },
      { name: 'Luke', toPay: 75, paid: 75 },
      { name: 'Laura', toPay: 75, paid: 60 },
      { name: 'Alan', toPay: 75, paid: 75 }
    ];

    // Laura needs to pay Harry
    const expectedOutput = [
      { name: 'Harry', toPay: -15, paid: 300 },
      { name: 'Luke', toPay: 0, paid: 75 },
      { name: 'Alan', toPay: 0, paid: 75 },
      { name: 'Laura', toPay: 15, paid: 60 }
    ];

    const result = calcWhenPaid(people)

    // Check if the result matches the expected output
    try {
      expect(result).to.deep.include.members(expectedOutput);
    } catch (error) {
      throw new Error(errorMessage(expectedOutput, result));
    }
  });

  // Laura needs to pay Luke
  it('should handle borrowing the pay for someone else', () => {
    const people = [
      { name: 'Harry', toPay: 75, paid: 300 },
      { name: 'Luke', toPay: 75, paid: 90 },
      { name: 'Laura', toPay: 75, paid: 60 },
      { name: 'Alan', toPay: 75, paid: 75 }
    ];

    const expectedOutput = [
      { name: 'Harry', toPay: 0, paid: 300 },
      { name: 'Luke', toPay: -15, paid: 90 },
      { name: 'Alan', toPay: 0, paid: 75 },
      { name: 'Laura', toPay: 15, paid: 60 }
    ];

    const result = calcWhenPaid(people)

    // Check if the result matches the expected output
    try {
      expect(result).to.deep.include.members(expectedOutput);
    } catch (error) {
      throw new Error(errorMessage(expectedOutput, result));
    }
  });

  it('should handle case where everyone have paid already but more people came in', () => {
    const people = [
      { name: 'Harry', toPay: 60, paid: 300 },
      { name: 'Luke', toPay: 60, paid: 75 },
      { name: 'Laura', toPay: 60, paid: 75 },
      { name: 'Alan', toPay: 60, paid: 75 },
      { name: 'Pawel', toPay: 60, paid: 0 }
    ];

    const expectedOutput = [
      { name: 'Harry', toPay: -15, paid: 300 },
      { name: 'Luke', toPay: -15, paid: 75 },
      { name: 'Laura', toPay: -15, paid: 75 },
      { name: 'Alan', toPay: -15, paid: 75 },
      { name: 'Pawel', toPay: 60, paid: 0 }
    ];

    const result = calcWhenPaid(people)

    // Check if the result matches the expected output
    try {
      expect(result).to.deep.include.members(expectedOutput);
    } catch (error) {
      throw new Error(errorMessage(expectedOutput, result));
    }
  });

});

describe('normalize function', () => {
  it('should normalize each toPay to zero if the proper amount have been paid in total', () => {

    // Laura needs to pay Harry
    const afterCalcOutput = [
      { name: 'Harry', toPay: -15, paid: 300 },
      { name: 'Luke', toPay: 0, paid: 75 },
      { name: 'Alan', toPay: 0, paid: 75 },
      { name: 'Laura', toPay: 15, paid: 60 }
    ];

    const resultFormat = [{ payer: 'Laura', payee: 'Harry' }]

    const result = normalize(afterCalcOutput)
    const simplifiedResult = result.map(({ payee, payer }) => ({ payee, payer }))

    try {
      expect(simplifiedResult).to.deep.include.members(resultFormat)
    } catch (error) {
      throw new Error(errorMessage(resultFormat, result));
    }
  })

  it('same but when the payee is not the accommodation payer', () => {

    const afterCalcOutput = [
      { name: 'Harry', toPay: 0, paid: 300 },
      { name: 'Luke', toPay: -15, paid: 90 },
      { name: 'Alan', toPay: 0, paid: 75 },
      { name: 'Laura', toPay: 15, paid: 60 }
    ];

    const resultFormat = [{ payer: 'Laura', payee: 'Luke' }]

    const result = normalize(afterCalcOutput)
    const simplifiedResult = result.map(({ payee, payer }) => ({ payee, payer }))

    try {
      expect(simplifiedResult).to.deep.include.members(resultFormat)
    } catch (error) {
      throw new Error(errorMessage(resultFormat, result));
    }

  })

  it('should handle case where everyone have paid already but more people came in', () => {

    const afterCalcOutput = [
      { name: 'Harry', toPay: -15, paid: 300 },
      { name: 'Luke', toPay: -15, paid: 75 },
      { name: 'Laura', toPay: -15, paid: 75 },
      { name: 'Alan', toPay: -15, paid: 75 },
      { name: 'Pawel', toPay: 60, paid: 0 }
    ]

    const result = normalize(afterCalcOutput)
    const simplifiedResult = result.map(({ payee, payer }) => ({ payee, payer }))

    const resultFormat = [
      { payer: 'Pawel', payee: 'Harry' },
      { payer: 'Pawel', payee: 'Luke' },
      { payer: 'Pawel', payee: 'Laura' },
      { payer: 'Pawel', payee: 'Alan' }
    ]

    try {
      expect(simplifiedResult).to.deep.include.members(resultFormat);
    } catch (error) {
      throw new Error(errorMessage(resultFormat, result));
    }
  });


  it('should handle the similar problem to real', () => {

    // 45.84
    // 12.57
    const afterCalcOutput = [
      { name: 'Harry', toPay: -22, paid: 312 },
      { name: 'Luke', toPay: -10, paid: 46 },
      { name: 'Laura', toPay: -10, paid: 46 },
      { name: 'Gaba', toPay: -10, paid: 46 },
      { name: 'Ines', toPay: -10, paid: 46 },
      { name: 'Aron', toPay: -10, paid: 46 },
      { name: 'Alvaro', toPay: 0, paid: 12 },
      { name: 'Lila', toPay: 0, paid: 12 },
      { name: 'Adrian', toPay: 12, paid: 0 },
      { name: 'Alan', toPay: 24, paid: 0 },
      { name: 'Pawel', toPay: 36, paid: 0 }
    ]


    const result = normalize(afterCalcOutput)
    const simplifiedResult = result.map(({ payee, payer }) => ({ payee, payer }))

    const resultFormat = [
      { payer: 'Pawel', payee: 'Harry' },
      { payer: 'Pawel', payee: 'Luke' },
      { payer: 'Pawel', payee: 'Laura' },
      { payer: 'Alan', payee: 'Laura' },
      { payer: 'Alan', payee: 'Gaba' },
      { payer: 'Alan', payee: 'Ines' },
      { payer: 'Adrian', payee: 'Ines' },
      { payer: 'Adrian', payee: 'Aron' }
    ]

    // Check if the result matches the expected output
    try {
      expect(simplifiedResult).to.deep.include.members(resultFormat);
    } catch (error) {
      throw new Error(errorMessage(resultFormat, result));
    }
  })

  // NOTE: The thing is not optimized. Pawel is paying just half a pound to Gaba which doesn't make any sense
  it('should handle the actual problem (with decimals)', () => {

    // 45.84
    // 12.57
    const afterCalcOutput = [
      { name: 'Harry', toPay: -12.07, paid: 301.16, share: 3 },
      { name: 'Luke', toPay: -11.09, paid: 45.84, share: 3 },
      { name: 'Laura', toPay: -11.09, paid: 45.84, share: 3 },
      { name: 'Gaba', toPay: -11.09, paid: 45.84, share: 3 },
      { name: 'Ines', toPay: -11.09, paid: 45.84, share: 3 },
      { name: 'Aron', toPay: -11.09, paid: 45.84, share: 3 },
      { name: 'Alvaro', toPay: -0.99, paid: 12.57, share: 1 },
      { name: 'Lila', toPay: -0.99, paid: 12.57, share: 1 },
      { name: 'Adrian', toPay: 11.58, paid: 0, share: 1 },
      { name: 'Alan', toPay: 23.17, paid: 0, share: 2 },
      { name: 'Pawel', toPay: 34.75, paid: 0, share: 3 }
    ]

    const result = normalize(afterCalcOutput)
    const simplifiedResult = result.map(({ payee, payer }) => ({ payee, payer }))

    const resultFormat = [
      { payer: 'Pawel', payee: 'Harry' },
      { payer: 'Pawel', payee: 'Luke' },
      { payer: 'Pawel', payee: 'Laura' },
      { payer: 'Pawel', payee: 'Gaba' },
      { payer: 'Alan', payee: 'Gaba' },
      { payer: 'Alan', payee: 'Ines' },
      { payer: 'Alan', payee: 'Aron' },
      { payer: 'Adrian', payee: 'Alvaro' },
      { payer: 'Adrian', payee: 'Aron' },
      { payer: 'Adrian', payee: 'Lila' },
    ]

    // Check if the result matches the expected output
    try {
      expect(simplifiedResult).to.deep.include.members(resultFormat);
    } catch (error) {
      throw new Error(errorMessage(resultFormat, result));
    }
  })


})
