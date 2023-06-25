import { useEffect } from "react";
import { useForm, useFieldArray, FieldErrors } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

let renderCount = 0;

interface FormValues {
  username: string;
  email: string;
  channel: string;
  social: {
    twitter: string;
    facebook: string;
  };
  phoneNumbers: string[];
  phNumbers: {
    number: string;
  }[];
  age: number;
  dateOfBirth: Date;
}

export const YouTubeForm = () => {
  const form = useForm<FormValues>({
    defaultValues: async () => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users/1"
      );
      const data = await response.json();
      return {
        username: "Batman",
        email: `test_${data.email}`,
        channel: "",
        social: {
          twitter: "",
          facebook: "",
        },
        phoneNumbers: ["", ""],
        phNumbers: [{ number: "" }],
        age: 0,
        dateOfBirth: new Date(),
      };
    },
    mode: "onBlur" // default mode is onSubmit, but can be changed here
  });

  const {
    register,
    control,
    handleSubmit,
    formState,
    watch,
    getValues,
    setValue,
    reset, // note that after reset, values aren't empty, but rather set to initial state
    trigger // for triggering validation manually
  } = form;

  const {
    errors,
    isDirty,
    isValid,
    isSubmitting, // Is set to true when form is being submitted
    isSubmitted, // Indicates whether the form has been submitted. Remains true until form reset
    isSubmitSuccessful,
    submitCount, // Number of times that the form has been submitted successfully
  } = formState;

  console.log({ isSubmitting, isSubmitted, isSubmitSuccessful, submitCount });

  const { fields, append, remove } = useFieldArray({
    name: "phNumbers",
    control,
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted", data);
  };

  const onError = (errors: FieldErrors) => {
    console.log("Form errors", errors);
  };

  const handleGetValues = () => {
    console.log("Get values", getValues("social.facebook")); // specific value
    // console.log("Get values", getValues()); // all values
    // console.log("Get values", getValues(["username", "email"])); // specific values
  };

  const handleSetValue = () => {
    setValue("username", "", {
      shouldValidate: true, // additional options
      shouldTouch: true,
      shouldDirty: true,
    });
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(); // reset method may receive additional options that allow us to costimize behaviour of the method
    }
  }, [isSubmitSuccessful]);

  useEffect(() => {
    const subscription = watch((value) => {
      // this way you can perform check against different fields in the form without losing the performance
      console.log("watch value:", value);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  renderCount++;
  return (
    <div>
      <h1>YouTube Form ({renderCount / 2})</h1>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <div className="form-control">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            {...register("username", {
              required: "Username is required",
            })}
          />
          <p className="error">{errors.username?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="email">E-mail</label>
          <input
            type="text"
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: "Invalid email format",
              },
              validate: {
                notAdmin: (fieldValue) => {
                  return (
                    fieldValue !== "admin@example.com" ||
                    "Enter a different email address"
                  );
                },
                notBlacklisted: (fieldValue) => {
                  return (
                    !fieldValue.endsWith("baddomain.com") ||
                    "This domain is not supported"
                  );
                },
                emailAvailable: async (fieldValue) =>{
                  const response = await fetch(`https://jsonplaceholder.typicode.com/users?email=${fieldValue}`)
                  const data = await response.json();
                  return data.length === 0 || "Email already exists"
                }
              },
            })}
          />
          <p className="error">{errors.email?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="channel">Channel</label>
          <input
            type="text"
            id="channel"
            {...register("channel", { required: "Channel is required" })}
          />
          <p className="error">{errors.channel?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="twitter">Twitter</label>
          <input
            type="text"
            id="twitter"
            {...register("social.twitter", {
              // when field is set to disabled, it's value is set to undefined and validation is not performed
              // disabled: true,
              disabled: watch("channel") === "",
              required: "Enter twitter profile",
            })}
          />
        </div>

        <div className="form-control">
          <label htmlFor="facebook">Facebook</label>
          <input type="text" id="facebook" {...register("social.facebook")} />
        </div>

        <div className="form-control">
          <label htmlFor="primary-phone">Primary phone number</label>
          <input
            type="text"
            id="primary-phone"
            {...register("phoneNumbers.0")}
          />
        </div>

        <div className="form-control">
          <label htmlFor="secondary-phone">Secondary phone number</label>
          <input
            type="text"
            id="secondary-phone"
            {...register("phoneNumbers.1")}
          />
        </div>

        <div>
          <label>List of phone numbers</label>
          <div>
            {fields.map((field, index) => {
              return (
                <div className="form-control" key={field.id}>
                  <input
                    type="text"
                    {...register(`phNumbers.${index}.number`)}
                  />
                  {index > 0 && (
                    <button type="button" onClick={() => remove(index)}>
                      Remove phone number
                    </button>
                  )}
                </div>
              );
            })}
            <button type="button" onClick={() => append({ number: "" })}>
              Add phone number
            </button>
          </div>
        </div>

        <div className="form-control">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            {...register("age", {
              valueAsNumber: true,
              required: {
                value: true,
                message: "Age is required",
              },
            })}
          />
          <p className="error">{errors.age?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="dateOfBirth">Date of birth</label>
          <input
            type="date"
            id="dateOfBirth"
            {...register("dateOfBirth", {
              valueAsDate: true,
              required: {
                value: true,
                message: "Date of birth is required",
              },
            })}
          />
          <p className="error">{errors.dateOfBirth?.message}</p>
        </div>

        <button disabled={!isDirty || isSubmitting}>Submit</button>

        <button type="button" onClick={handleGetValues}>
          Get values
        </button>

        <button type="button" onClick={handleSetValue}>
          Set value
        </button>

        <button type="button" onClick={() => reset()}>
          Reset
        </button>

        {/* trigger method may receive specific fields */}
        <button type="button" onClick={() => trigger('age')}>
          Validate
        </button>
      </form>
      <DevTool control={control} />
    </div>
  );
};
