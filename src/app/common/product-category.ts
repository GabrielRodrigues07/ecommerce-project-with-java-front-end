export class ProductCategory {

  constructor(public _id: number,
              public _categoryName: string) {
  }


  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get categoryName(): string {
    return this._categoryName;
  }

  set categoryName(value: string) {
    this._categoryName = value;
  }
}
