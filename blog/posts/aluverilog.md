---
title: building an alu in verilog
date: 2025-05-28
description: how to build an alu in verilog
author: rishab anand

hero: /images/verilog.png
---

this writing covers how to make a very simple arithmetic logical unit in systemverilog using full adder. 
an alu is the core building block inside a processor. it is primarily responsible for performing
mathematical and logical operations on binary data. to implement this alu, we need to implement 2 other 
different parts which include a full adder and multi-bit adder

## part 1: full adder implementation  

a full adder is the most fundamental building block of arithmetic circuits. before a multi-bit adder can be implemented, the system needs to add at a single bit level. so for example, the system wants to perform 19 + 13. in this case, the system would add the right most column first(9+3=12), write down 2 and carry over 1 to the next column. then the system would add the next column including the carry. binary addition works the same way but with 0's and 1's. a key thing to keep in mind is the carry. this carry means more bits(+1) are needed to handle it if a column chain wants to be implemented. so for this full adder, the following i/o exists: 

```
input  a,    // first bit being added
input  b,    // second bit being added
input  cin,  // carry coming IN from the previous column
output s,    // sum bit result
output cout  // carry going OUT to the next column
```

there is a need to chain multiple columns together so 3 inputs have to be used rather than 2 inputs, 
which is a half adder. to actually implement this full adder, 2 equations are required; 1 for the 
output and 1 for the carry. these expressions can be derived from the truth table below using kmaps(not
shown here).

```
a  b  cin | cout  s
0  0   0  |  0    0    (0+0+0 = 0,  no carry)
0  0   1  |  0    1    (0+0+1 = 1,  no carry)
0  1   0  |  0    1    (0+1+0 = 1,  no carry)
0  1   1  |  1    0    (0+1+1 = 2,  write 0 carry 1)
1  0   0  |  0    1    (1+0+0 = 1,  no carry)
1  0   1  |  1    0    (1+0+1 = 2,  write 0 carry 1)
1  1   0  |  1    0    (1+1+0 = 2,  write 0 carry 1)
1  1   1  |  1    1    (1+1+1 = 3,  write 1 carry 1)

```
these expressions come out to be the following : 

Sum — output is 1 when an odd number of inputs are 1 → XOR | `s = a XOR b XOR cin`
Carry — output is 1 when at least two inputs are 1 → majority function 
`cout = (a AND b) OR (a AND cin) OR (b AND cin)`

in verilog, the code is really simple. you can use `assign`(continuously combinational logic) simply and set the sum and carry output. see the code below: 

```
module full_adder (
    input a,    
    input b,    
    input cin, 
    output s,   
    output cout
);
assign s = a ^ b ^ cin; 
assign cout = (a & b) | (a & cin) | (b & cin); 
endmodule
```
a full adder is stateless. as in, it has no memory, clock, and history. given the same inputs, it will always provide the same outputs instantly. this is crucial because in a multi-bit adder, the carry output needs to propagate through the chain instantly. see the following circuit simulation:  

![full adder simulation waveform](/images/simulation1.png)


##  part 2: multi-bit adder and subtractor 

a single full adder only handles 1 bit. real numbers that need to be processed can be 8,16... bits wide. now, this multi-bit adder and subtractor will handle a bigger bit wide number. this variable can be called `DATAW`. this multi-bit adder will only be implemented using the full adder as an instant in the system verilog code, or rather a collection of full adder instances using `generate`. so for this multi-bit adder, the following i/o exists: 

```
input  [DATAW-1:0] i_dataa,  // first full number (e.g. 8 bits wide)
input  [DATAW-1:0] i_datab,  // second full number
input              i_op,     // 0 = add, 1 = subtract
output [DATAW-1:0] o_result  // the result
```

since only a full adder is being used for this multi-bit adder, 8 full adders are needed, one per bit column connected like: 

```
bit7        bit6        bit1        bit0
  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
  │  FA  │◄───│  FA  │◄───│  FA  │◄───│  FA  │◄── carry[0]=i_op
  └──────┘    └──────┘    └──────┘    └──────┘
     │            │           │           │
  result[7]   result[6]   result[1]   result[0]

```

The carry ripples left through every adder, hence the name “Ripple Carry Adder”. Each full adder must wait for the carry from the right full adder before it can produce its final result. 

The issue: how do we subtract using full adders. It's actually pretty simple, two’s complement can be used to solve this issue. So, for example, A - B = A + (-B). Now, to negate B in two’s complement, we invert all the bits of B and add 1. So, A - B = A + (~B) + 1. If we look at the circuit of what we are trying to build here, it uses XOR gates and the carry-in. See the circuit below: 

![multibit adder circuit](/images/multibitadder.png)


To distinguish between addition and subtraction, a conventional reference variable should be used. From the circuit above, you can see that it is “i_op”, where if “i_op” is 0, then we add, otherwise we subtract. this turns out to be: 

```
b_xor[i] = i_datab[i] XOR i_op
i_op=0: b XOR 0 = b      → B unchanged    → addition
i_op=1: b XOR 1 = NOT b  → B inverted     → first step of negation

We need another reference variable to determine if we need to +1, so: 

i_op=0: carry[0] = 0  → no extra addition    → A + B
i_op=1: carry[0] = 1  → adds 1 to ~B         → A + ~B + 1 = A - B

```
see the full code below: 

```
module add_sub # (
    parameter DATAW = 2 
)(
    input  [DATAW-1:0] i_dataa,  
    input  [DATAW-1:0] i_datab,  
    input  i_op,                 
    output [DATAW-1:0] o_result  
);

wire [DATAW-1:0] b_xor; 
wire [DATAW:0] carry; 

assign carry[0] = i_op;   
genvar i; // variable for the  loop
generate 
for (i = 0; i < DATAW; i++) begin: adder_chain
    assign b_xor[i] = i_datab[i] ^ i_op; 
    full_adder fa (
        .a (i_dataa[i]), 
        .b (b_xor[i]), 
        .cin (carry[i]), 
        .s (o_result[i]), 
        .cout(carry[i + 1]) 
    ); 
    
end 
endgenerate
endmodule
```






Below is the simulation for the multi-bit adder and subtractor: 

![multibit adder sim](/images/lab2simulation.png)

Now this part is purely combinational. As in, the inputs go in and the output goes out immediately with no timing control at all. To actually build the ALU, we will wrap this system in a clocked, registered system by adding: 

1. Input registers
2. Output registers
3. Additional operations(multiplying, squaring)
4. A selection mechanism 

This multi-bit adder and subtractor will become a subcomponent of the ALU. 

## part 3: building the alu 

The ALU we are building will support four operations on a `DATAW` bit number. The selection mechanisms is as follows:

2'b00 → Addition       (A + B)
2'b01 → Subtraction    (A - B)
2'b10 → Multiplication (A * B)
2'b11 → Squaring       (A²)


The main difference here is that this implementation will be sequential. It will have a clock and registers. 

the i/o will be the following: 


```
input              clk,          // clock signal
input              rstn,         // active-low synchronous reset
input  [DATAW-1:0] i_dataa,      // first operand
input  [DATAW-1:0] i_datab,      // second operand
input  [1:0]       i_op,         // 2-bit operation selector
output [DATAW-1:0] o_result      // result

```

but why register inputs and outputs? this is a fundamental concept in digital design called pipelining and timing closure. in purely combinational logic(like part 1 & 2), signals will propagate through gates with a slight delay. for a larger circuit, these delays will eventually add up. by registering the inputs and outputs we: 

1. sample inputs on the clock rising edge
2. hold outputs stable between clock edges 
3. allow our simulation tool to perform timing analysis 


the tradeoff here is latency. the results take 2 clock cycles to appear(one cycle to register inputs and 1 cycle to register outputs). But throughput remains 1 operation per clock cycle once the pipeline is full.

below is the code for the full alu implementation: 



```
module alu # (
    parameter DATAW = 32 // Bitwidth of ALU operands
)(
    input  clk,                   // Input clock signal
    input  rstn,                  // Active-low reset signal
    input  [DATAW-1:0] i_dataa,   // First operand (A)
    input  [DATAW-1:0] i_datab,   // Second operand (B)
    input  [1:0] i_op,  // Operation code (00: A+B, 01: A-B, 10: A*B, 11: A^2)
    output [DATAW-1:0] o_result   // ALU output
);

logic [DATAW-1:0] dataa_reg; 
logic [DATAW-1:0] datab_reg; 
logic [1:0] op_reg; 
 

always_ff @(posedge clk) begin 
    if (!rstn) begin
        dataa_reg <= '0; 
        datab_reg <= '0; 
        op_reg <= '0; 
    end else begin
        dataa_reg <= i_dataa; 
        datab_reg <= i_datab; 
        op_reg <= i_op; 
    end 
end 

// instantiate multi-bit adder and subtractor 


logic [DATAW-1:0] addsub_result; 

add_sub #(.DATAW(DATAW)) addsub_inst (
    .i_dataa (dataa_reg), 
    .i_datab (datab_reg),
    .i_op (op_reg[0]), // op[0] = 0 -> add, op[0]=1 -> subtract
    .o_result (addsub_result)
);   

// combinational intermediate results 

logic [DATAW-1:0] mul_result; 
logic [DATAW-1:0] sqr_result; 

always_comb begin 
    mul_result = dataa_reg * datab_reg; 
    sqr_result = dataa_reg * dataa_reg; 
end 

// register output 

logic [DATAW-1:0] result_reg; 
always_ff @(posedge clk) begin 
    if(!rstn) begin
        result_reg <= '0;
    end else begin
        case (op_reg)
            2'b00: result_reg <= addsub_result; 
            2'b01: result_reg <= addsub_result; 
            2'b10: result_reg <= mul_result; 
            2'b11: result_reg <= sqr_result; 
        endcase
        
    end 
end 

assign o_result = result_reg; 
endmodule

```


below is the simulation for this alu: 


![alu sim](/images/alusim.png)


here's how data moves through the entire ALU across clock cycles: 


```
Cycle 1 - Rising edge:
    i_dataa, i_datab, i_op → sampled into dataa_reg, datab_reg, op_reg

Between cycles 1 and 2 - Combinational:
    dataa_reg, datab_reg → add_sub → addsub_result (instantly)
    dataa_reg, datab_reg → * → mul_result (instantly)
    dataa_reg → * → sqr_result (instantly)

Cycle 2 - Rising edge:
    case(op_reg) selects correct result → latched into result_reg
    result_reg → o_result (via assign)
```

lets also take a moment to discuss the utilization of this alu on the fpga that it was ran on. see the following: 


![util graph](/images/utilgraph.png)

lut: lookup tables. 86 used out of 117,120(0.07%). these tables are responsible for implementing the combinational logic. the xor gates, carry logic, and case statement multiplexer all map to these lut's. 86 is very small, meaning this alu is tiny compared to what the fpga can handle. 

ff: flip flops. 98 used out of 234,240 (0.04%). these are the registers. dataa_reg = 32 bits → 32 flip flops, datab_reg = 32 bits → 32 flip flops, op_reg = 2 bits → 2 flip flops, result_reg = 32 bits → 32 flip flops. you add them up and you get 98. 

dsp: Digital Signal Processor blocks. 3 used out of 1,248 (0.24%). these are the dedicated hardware multiplier blocks on the fpga. the * operator for multiplication and squaring get mapped to this. these are much more efficient than lut for multiplication. 

i/o: Input/Output pins. 100 used out of 189 (52.91%). these are the physical pins. 52.91% is high but that's expected since 32-bit wide buses are used. 

key takeaway: the alu barely uses any of the fpgas resources, <1% of lut's and ff's. this shows how powerful modern fpga's are. 

--- 

that concludes this writing. thanks for reading.

<a href="#" class="toc-back" style="display:inline-block;margin-top:8px;">↑ top</a>

