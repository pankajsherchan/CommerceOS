from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    words = value.split("_")

    return words[0] + "".join(word.capitalize() for word in words[1:])


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        extra="forbid",
        populate_by_name=True,
    )


class Money(ApiModel):
    amount: int = Field(ge=0)
    currency: Literal["USD"]
