export default function PlayerCodeInstance() {
  const sampleCode = `number_list = []

num = ""

while num != 0:
    num = int(input("Please enter a number (0 to end): "))
    if num == 0:
        break
    number_list.append(num)

odd_numbers = []
even_numbers = []
for i in range(len(number_list)):
    if number_list[i] % 2 == 0:
        even_numbers.append(number_list[i])
    else:
        odd_numbers.append(number_list[i])

average = sum(number_list) / len(number_list)


odd_numbers.sort()
even_numbers.sort()

print(f"Odd numbers: {odd_numbers}")
print(f"Even numbers: {even_numbers}")
print(f"Average = {average:.2f}")
`;
  return (

    <>
      <div className="box-border border-1 p-4 w-1/1">
        John
      </div>
      <div className="max-w-2xl w-full">
        <pre className="bg-gray-900 text-green-400 p-4 overflow-x-auto text-sm">
          <code>{sampleCode}</code>
        </pre>
      </div>

    </>
  )
}